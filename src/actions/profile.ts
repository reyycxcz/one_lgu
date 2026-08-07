"use server";

import { createClient } from "@/lib/supabase/server";
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
