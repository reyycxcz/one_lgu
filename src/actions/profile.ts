"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { logAction } from "@/lib/audit/logger";
import { notifyUser } from "@/lib/notifications/notify";
import { profileUpdateSchema, passwordUpdateSchema } from "@/lib/validations/profile.schema";

export async function updateProfile(formData: FormData) {
  const session = await requireSession();
  const supabase = await createClient();

  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    barangayCode: formData.get("barangayCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phone, address, barangayCode } = parsed.data;

  // If barangayCode is provided, look up the barangay_id
  let barangayId: string | null = null;
  if (barangayCode) {
    const { data: barangay } = await supabase
      .from("barangays")
      .select("id")
      .eq("code", barangayCode)
      .single();
    barangayId = barangay?.id || null;
  }

  const updateData: Record<string, string | null> = {
    full_name: fullName,
    email: email,
    phone: phone || null,
    address: address || null,
  };

  if (barangayCode) {
    updateData.barangay_id = barangayId;
  }

  const { error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", session.user.id);

  if (error) {
    return { error: error.message };
  }

  await logAction({
    actorId: session.user.id,
    action: "profile.updated",
    entityType: "profile",
    entityId: session.user.id,
  });

  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const session = await requireSession();
  const supabase = await createClient();

  const parsed = passwordUpdateSchema.safeParse({
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.newPassword });

  if (error) {
    return { error: error.message };
  }

  await logAction({
    actorId: session.user.id,
    action: "profile.password_changed",
    entityType: "profile",
    entityId: session.user.id,
  });

  return { success: true };
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can activate or deactivate accounts" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { error: error.message };
  }

  await logAction({
    actorId: profile.id,
    action: isActive ? "user.activated" : "user.deactivated",
    entityType: "profile",
    entityId: userId,
  });

  return { success: true };
}

/**
 * Approve a pending account request: activate the account and notify the user.
 */
export async function approveAccountRequest(userId: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can approve account requests" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: true })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "user.request_approved",
    entityType: "profile",
    entityId: userId,
  });

  await notifyUser({
    recipientId: userId,
    title: "Account approved",
    message: "Your OneLGU account has been approved. You now have full access to barangay services.",
    type: "account_update",
    entityType: "profile",
    entityId: userId,
  });

  return { success: true };
}

/**
 * Reject a pending account request: keep it deactivated and notify the user
 * with the reason.
 */
export async function rejectAccountRequest(userId: string, reason: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can reject account requests" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: false })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "user.request_rejected",
    entityType: "profile",
    entityId: userId,
    metadata: { reason },
  });

  await notifyUser({
    recipientId: userId,
    title: "Account request declined",
    message: `Your OneLGU account request was declined.${reason ? ` Reason: ${reason}` : ""} Please contact your Barangay Hall for assistance.`,
    type: "account_update",
    entityType: "profile",
    entityId: userId,
  });

  return { success: true };
}

/**
 * Data-subject "delete my account" (RA 10173 right to erasure). Anonymizes
 * PII rather than hard-deleting the row: certification_requests, complaints,
 * reports, and audit_logs all reference profiles(id) with the default
 * ON DELETE NO ACTION, so a hard delete would fail with a foreign-key
 * violation for any user with submission history anyway — and government
 * records-retention rules require keeping the transactional record even
 * when the requester's personal data is erased. Uses the admin client
 * because `role`/`is_active` are trigger-protected against self-service
 * updates (see protect_profile_privileged_fields in 0001_init.sql).
 */
export async function deleteMyAccount(confirmText: string) {
  const session = await requireSession();

  if (confirmText.trim().toUpperCase() !== "DELETE") {
    return { error: 'Please type "DELETE" to confirm.' };
  }

  const admin = createAdminClient();
  const anonymizedEmail = `deleted-${session.user.id}@onelgu.invalid`;

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: "Deleted User",
      email: anonymizedEmail,
      phone: null,
      address: null,
      is_active: false,
    })
    .eq("id", session.user.id);

  if (profileError) {
    return { error: profileError.message };
  }

  // Lock the auth account out too: randomize the password, swap the email
  // so it can't be recovered, and ban sign-in outright as a second layer
  // on top of the is_active check.
  const { error: authError } = await admin.auth.admin.updateUserById(session.user.id, {
    password: crypto.randomUUID() + crypto.randomUUID(),
    email: anonymizedEmail,
    ban_duration: "876000h", // ~100 years — effectively permanent
  });

  if (authError) {
    return { error: authError.message };
  }

  await logAction({
    actorId: session.user.id,
    action: "profile.account_deleted",
    entityType: "profile",
    entityId: session.user.id,
  });

  const supabase = await createClient();
  await supabase.auth.signOut();

  return { success: true };
}
