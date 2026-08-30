"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { barangaySchema } from "@/lib/validations/barangay.schema";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

export async function createBarangay(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can add barangays" };
  }

  const parsed = barangaySchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    municipality: formData.get("municipality"),
    province: formData.get("province"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barangays")
    .insert({
      name: parsed.data.name,
      code: parsed.data.code,
      municipality: parsed.data.municipality,
      province: parsed.data.province,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "barangay.created",
    entityType: "barangay",
    entityId: data.id,
  });

  return { data };
}

export async function updateBarangay(id: string, formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can edit barangays" };
  }

  const parsed = barangaySchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
    municipality: formData.get("municipality"),
    province: formData.get("province"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("barangays")
    .update({
      name: parsed.data.name,
      code: parsed.data.code,
      municipality: parsed.data.municipality,
      province: parsed.data.province,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "barangay.updated",
    entityType: "barangay",
    entityId: id,
  });

  return { data };
}

export async function toggleBarangayActive(id: string, isActive: boolean) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can activate or deactivate barangays" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("barangays")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: isActive ? "barangay.activated" : "barangay.deactivated",
    entityType: "barangay",
    entityId: id,
  });

  return { success: true };
}

/**
 * Get current barangay service availability (Open / Closed).
 * Checks the barangays table column or latest service status log. Defaults to true (Open).
 */
export async function getBarangayServiceStatus(barangayId: string): Promise<boolean> {
  if (!barangayId) return true;
  try {
    const adminSupabase = createAdminClient();

    // 1. Check the is_service_open column on the barangays table
    const { data: brgy, error: brgyError } = await adminSupabase
      .from("barangays")
      .select("is_service_open")
      .eq("id", barangayId)
      .maybeSingle();

    if (!brgyError && brgy && typeof brgy.is_service_open === "boolean") {
      return brgy.is_service_open;
    }

    // 2. Fallback: Check latest audit log entry using admin client (bypassing RLS)
    const { data: auditData } = await adminSupabase
      .from("audit_logs")
      .select("action, metadata")
      .eq("entity_type", "barangay_service")
      .eq("entity_id", barangayId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (auditData) {
      if (auditData.action === "barangay.service_closed") return false;
      if (auditData.action === "barangay.service_opened") return true;
      if (typeof (auditData.metadata as { isOpen?: boolean } | null)?.isOpen === "boolean") {
        return (auditData.metadata as { isOpen: boolean }).isOpen;
      }
    }

    return true; // Default is open
  } catch (err) {
    console.error("Error reading barangay service status:", err);
    return true;
  }
}

/**
 * Toggle barangay service availability (Open / Closed / Off-duty).
 * Allowed for Barangay Captains and Barangay Secretaries of the assigned barangay, and Super Admins.
 */
export async function toggleBarangayServiceStatus(barangayId: string, isOpen: boolean) {
  const profile = await requireProfile();

  const isCaptainOrSecretary =
    profile.role === "barangay_official" &&
    (profile.position === "captain" || profile.position === "secretary") &&
    profile.barangay_id === barangayId;
  const isSuperAdmin = profile.role === "super_admin";

  if (!isCaptainOrSecretary && !isSuperAdmin) {
    return { error: "Only Barangay Captains and Secretaries can toggle their Barangay's service availability." };
  }

  const adminSupabase = createAdminClient();

  // Try updating the barangays table column
  try {
    await adminSupabase
      .from("barangays")
      .update({ is_service_open: isOpen })
      .eq("id", barangayId);
  } catch (err) {
    console.warn("Could not update is_service_open column on barangays:", err);
  }

  // Record in audit logs
  await logAction({
    actorId: profile.id,
    action: isOpen ? "barangay.service_opened" : "barangay.service_closed",
    entityType: "barangay_service",
    entityId: barangayId,
    barangayId,
    metadata: { isOpen, updatedByPosition: profile.position, updatedByName: profile.full_name },
  });

  revalidatePath("/barangay/dashboard");
  revalidatePath("/resident/dashboard");

  return { success: true, isOpen };
}

