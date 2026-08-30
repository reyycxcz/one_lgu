"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession, requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { logAction } from "@/lib/audit/logger";
import { notifyUser } from "@/lib/notifications/notify";
import { profileUpdateSchema, passwordUpdateSchema, createOfficialSchema, createDepartmentReceiverSchema, createResidentSchema } from "@/lib/validations/profile.schema";
import type { BarangayPosition } from "@/lib/auth/positions";
import type { LguDepartment } from "@/lib/auth/departments";

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

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
    // Changing your password (voluntarily or because it was forced) always
    // satisfies the "must change password" requirement, regardless of which
    // page the change was made from.
    data: { must_change_password: false },
  });

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
 * Super-admin provisions a new barangay official account, with a password
 * the admin sets directly (handed to the official through some secure
 * out-of-band channel — it's never emailed in plaintext). Two steps:
 *
 * 1. Create the auth user via the admin API. handle_new_user() (the DB
 *    trigger that inserts the profiles row) always sets role: "resident" no
 *    matter what metadata is passed here — by design, it never trusts
 *    client-suppliable data for access fields (that was the original
 *    privilege-escalation hole this app's security hardening closed; see
 *    SECURITY-AUDIT-CHECKLIST.md). So it comes back as a resident.
 * 2. Promote that row to barangay_official (+ barangay + position) using
 *    OUR OWN session client, not the admin client — protect_profile_
 *    privileged_fields only allows role/barangay_id/position changes when
 *    get_user_role() is genuinely 'super_admin' for the caller's session,
 *    which is true here since we really are the signed-in super admin.
 *
 * The account is flagged must_change_password: true in its auth metadata,
 * so requireRole() forces them through /change-password on their first
 * login before they can reach anything else — the admin-set password is
 * only ever meant to be used once.
 */
export async function createBarangayOfficial(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can add barangay officials" };
  }

  const parsed = createOfficialSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    barangayId: formData.get("barangayId"),
    position: formData.get("position"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phone, password, barangayId, position } = parsed.data;

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, must_change_password: true },
    // proxy.ts (middleware) and login() both read role from app_metadata to
    // decide which paths a session can reach — it has to be set here at
    // creation time, not just in profiles.role, or the account gets treated
    // as a resident and blocked from every /barangay/* route on its very
    // first request.
    app_metadata: { role: "barangay_official" },
  });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create the account" };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role: "barangay_official",
      barangay_id: barangayId,
      position: position || null,
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", created.user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await logAction({
    actorId: profile.id,
    action: "user.official_created",
    entityType: "profile",
    entityId: created.user.id,
    barangayId,
    metadata: { position: position || null },
  });

  return { success: true };
}

/**
 * Super-admin provisions a new LGU department receiver account (Treasurer's
 * Office, Planning & Development Office, etc). Same two-step pattern and
 * forced-password-change treatment as createBarangayOfficial above — see
 * that function's comment for why role/department are set via our own
 * session client rather than the admin client.
 */
export async function createLguReceiver(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can add department receivers" };
  }

  const parsed = createDepartmentReceiverSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    department: formData.get("department"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phone, password, department } = parsed.data;

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, must_change_password: true },
    // proxy.ts (middleware) and login() both read role from app_metadata to
    // decide which paths a session can reach — it has to be set here at
    // creation time, not just in profiles.role, or the account gets treated
    // as a resident and blocked from every /lgu/* route on its very first
    // request.
    app_metadata: { role: "lgu_reviewer" },
  });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create the account" };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role: "lgu_reviewer",
      department,
      full_name: fullName,
      phone: phone || null,
    })
    .eq("id", created.user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await logAction({
    actorId: profile.id,
    action: "user.department_receiver_created",
    entityType: "profile",
    entityId: created.user.id,
    metadata: { department },
  });

  return { success: true };
}

/**
 * Super-admin provisions a new resident account directly from the LGU portal.
 */
export async function createResident(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can add resident accounts" };
  }

  const parsed = createResidentSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    barangayId: formData.get("barangayId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { fullName, email, phone, password, barangayId } = parsed.data;

  const admin = createAdminClient();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, must_change_password: true },
    app_metadata: { role: "resident" },
  });

  if (createError || !created.user) {
    return { error: createError?.message || "Could not create the resident account" };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      role: "resident",
      barangay_id: barangayId,
      full_name: fullName,
      phone: phone || null,
      is_active: true,
    })
    .eq("id", created.user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await logAction({
    actorId: profile.id,
    action: "user.resident_created",
    entityType: "profile",
    entityId: created.user.id,
    barangayId,
  });

  return { success: true };
}

/**
 * Assign a barangay staff position (Secretary, Treasurer, etc). Super-admin
 * only — the protect_profile_privileged_fields DB trigger enforces this too,
 * but checking here first gives a clean error message instead of a raw
 * Postgres exception.
 */
export async function setBarangayPosition(userId: string, position: BarangayPosition | null) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can assign barangay positions" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ position })
    .eq("id", userId)
    .eq("role", "barangay_official");

  if (error) {
    return { error: error.message };
  }

  await logAction({
    actorId: profile.id,
    action: "user.position_updated",
    entityType: "profile",
    entityId: userId,
    metadata: { position },
  });

  return { success: true };
}

/**
 * Assign an lgu_reviewer to a receiving department (Treasurer's Office,
 * etc). Super-admin only, same trigger-backed protection as
 * setBarangayPosition above.
 */
export async function setLguDepartment(userId: string, department: LguDepartment | null) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can assign departments" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ department })
    .eq("id", userId)
    .eq("role", "lgu_reviewer");

  if (error) {
    return { error: error.message };
  }

  await logAction({
    actorId: profile.id,
    action: "user.department_updated",
    entityType: "profile",
    entityId: userId,
    metadata: { department },
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
