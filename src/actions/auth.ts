"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, onboardingSchema } from "@/lib/validations/auth.schema";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth/session";

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message || "Invalid email or password. Please try again." };
  }

  const user = authData.user;
  if (!user) {
    return { error: "User session not found after login." };
  }

  const role = user.app_metadata?.role || user.user_metadata?.role || "resident";

  let redirectTo = "/resident/dashboard";
  if (role === "super_admin" || role === "lgu_reviewer") {
    redirectTo = "/lgu/dashboard";
  } else if (role === "barangay_official") {
    redirectTo = "/barangay/dashboard";
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

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        role: "resident",
      },
    },
  });

  if (authError) return { error: authError.message };

  if (authData.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      barangay_id: null,
      role: "resident",
      full_name: parsed.data.fullName,
      email: parsed.data.email,
    });

    if (profileError) return { error: profileError.message };
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

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
