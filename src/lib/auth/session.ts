import { createClient } from "../supabase/server";
import { UserRole } from "./rbac";
import { redirect } from "next/navigation";

export async function getSession() {
  const supabase = await createClient();
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
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

  return profile;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await requireProfile();
  
  if (profile.role === "super_admin") {
    return profile;
  }
  
  if (!allowedRoles.includes(profile.role as UserRole)) {
    redirect("/not-found"); // Silent rejection for security
  }

  return profile;
}
