"use server";

import { createClient } from "@/lib/supabase/server";
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
