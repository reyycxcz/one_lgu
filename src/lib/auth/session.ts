import { createClient } from "../supabase/server";
import { UserRole } from "./rbac";
import { redirect } from "next/navigation";

// Returns a session-shaped object (`{ user }`) built from getUser(), which
// re-verifies the JWT against the Supabase Auth server instead of trusting
// a locally-decoded cookie (getSession() is unsafe for this — see
// SECURITY-AUDIT-CHECKLIST.md). No caller in this codebase reads
// session-level fields (access_token, etc.) — only session.user.*.
export async function getSession() {
  const supabase = await createClient();
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { user };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireProfile() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*, barangays(*)")
    .eq("id", session.user.id)
    .single();

  if (error || !profile) {
    // If auth session exists but profile doesn't, force sign out & login
    await supabase.auth.signOut();
    redirect("/login");
  }

  // is_active backs both the admin deactivate-account toggle and account
  // deletion (which anonymizes + deactivates rather than hard-deleting, to
  // preserve records-retention obligations) — neither does anything unless
  // this is actually enforced here.
  if (!profile.is_active) {
    await supabase.auth.signOut();
    redirect("/login?deactivated=1");
  }

  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await requireProfile();

  // MFA is opt-in — we don't force anyone to set it up. But if a user HAS
  // enrolled a verified TOTP factor, they must complete the challenge on a
  // fresh session (aal1 -> aal2), otherwise enabling it would be meaningless.
  const supabase = await createClient();
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  // nextLevel === "aal2" while currentLevel is lower means a verified factor
  // exists but this session hasn't satisfied it yet.
  if (aal && aal.currentLevel !== "aal2" && aal.nextLevel === "aal2") {
    redirect("/mfa-challenge");
  }

  if (profile.role === "super_admin") {
    return profile;
  }

  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect("/not-found"); // Silent rejection for security
  }

  return profile;
}

// Stricter than requireRole(["super_admin"]) callers might expect: this one
// does NOT auto-pass every role, it only ever allows super_admin. Use for
// settings/user-management/audit-export pages that lgu_reviewer must not reach.
export async function requireSuperAdmin() {
  const profile = await requireProfile();

  if (profile.role !== "super_admin") {
    redirect("/not-found"); // Silent rejection for security
  }

  return profile;
}
