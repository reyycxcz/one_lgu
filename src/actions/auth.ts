"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, onboardingSchema, forgotPasswordSchema } from "@/lib/validations/auth.schema";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireSession } from "@/lib/auth/session";
import { logAction } from "@/lib/audit/logger";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  // Only meaningful once Captcha protection is turned on in the Supabase
  // Auth dashboard with a Turnstile secret key — until then Supabase ignores
  // this field entirely, so it's safe to always pass through.
  const captchaToken = formData.get("cf-turnstile-response") as string | undefined;

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
    options: captchaToken ? { captchaToken } : undefined,
  });

  if (error) {
    return { error: error.message || "Invalid email or password. Please try again." };
  }

  const user = authData.user;
  if (!user) {
    return { error: "User session not found after login." };
  }

  const role = user.app_metadata?.role || user.user_metadata?.role || "resident";

  await logAction({
    actorId: user.id,
    action: "auth.login",
    entityType: "auth",
    entityId: user.id,
  });

  let redirectTo = "/resident/dashboard";
  if (role === "super_admin" || role === "lgu_reviewer") {
    redirectTo = "/lgu/dashboard";
  } else if (role === "barangay_official") {
    redirectTo = "/barangay/dashboard";
  }

  // MFA is opt-in. Only users who already enrolled a verified factor are
  // challenged here (aal1 -> aal2) — we never force setup at login.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.currentLevel !== "aal2" && aal.nextLevel === "aal2") {
    redirectTo = "/mfa-challenge";
  }

  return { success: true, redirectTo };
}

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  // The checkbox is `required` client-side, but that's trivially bypassed by
  // posting the form directly — re-check server-side so consent is actually
  // enforced, not just suggested.
  if (formData.get("consent") !== "on") {
    return { error: "You must agree to the Privacy Policy to create an account." };
  }

  const supabase = await createClient();
  const captchaToken = formData.get("cf-turnstile-response") as string | undefined;

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: "resident",
      },
      ...(captchaToken ? { captchaToken } : {}),
    },
  });

  if (authError) return { error: authError.message };

  // The `profiles` row is auto-created by the on_auth_user_created DB
  // trigger (always role: "resident") — the app never inserts into
  // profiles directly, since a client-writable insert policy would be a
  // privilege-escalation vector.
  if (authData.user) {
    // Evidence-of-consent trail for RA 10173 — stored in the existing
    // metadata jsonb rather than a new profiles column, no migration needed.
    await logAction({
      actorId: authData.user.id,
      action: "auth.registered",
      entityType: "profile",
      entityId: authData.user.id,
      metadata: { privacy_policy_consent: true, consent_given_at: new Date().toISOString() },
    });
  }

  // If email confirmation is disabled, signUp() also returns an active session.
  if (authData.session) {
    return { success: true, redirectTo: "/onboarding" };
  }

  return { success: true };
}

export async function completeOnboarding(formData: FormData) {
  const session = await requireSession();

  const parsed = onboardingSchema.safeParse({
    municipality: formData.get("municipality"),
    barangayCode: formData.get("barangayCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: barangay } = await supabase
    .from("barangays")
    .select("id")
    .eq("code", parsed.data.barangayCode)
    .single();

  if (!barangay) {
    return { error: "Selected barangay was not found. Please try again." };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ barangay_id: barangay.id })
    .eq("id", session.user.id);

  if (profileError) return { error: profileError.message };

  await logAction({
    actorId: session.user.id,
    action: "auth.onboarding_completed",
    entityType: "profile",
    entityId: session.user.id,
    barangayId: barangay.id,
  });

  return { success: true };
}

export async function forgotPassword(formData: FormData) {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/reset-password`,
  });

  // Always report success, whether or not the email exists, to avoid leaking
  // which addresses are registered (user enumeration).
  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await logAction({
      actorId: user.id,
      action: "auth.logout",
      entityType: "auth",
      entityId: user.id,
    });
  }

  await supabase.auth.signOut();
  redirect("/login");
}
