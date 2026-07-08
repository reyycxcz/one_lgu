"use server";

import { createClient } from "@/lib/supabase/server";
import { certificationRequestSchema } from "@/lib/validations/certification.schema";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

export async function submitCertificationRequest(formData: FormData) {
  const profile = await requireProfile();

  const parsed = certificationRequestSchema.safeParse({
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    requirements: JSON.parse((formData.get("requirements") as string) || "[]"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("certification_requests")
    .insert({
      requester_id: profile.id,
      barangay_id: profile.barangay_id,
      type: parsed.data.type,
      purpose: parsed.data.purpose,
      requirements: parsed.data.requirements,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "certification.submitted",
    entityType: "certification_request",
    entityId: data.id,
    barangayId: profile.barangay_id,
  });

  return { data };
}

export async function updateCertificationStatus(
  id: string,
  status: string,
  reason?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official", "super_admin"])) {
    return { error: "Insufficient permissions" };
  }

  const supabase = await createClient();

  const updatePayload: Record<string, unknown> = { status };
  
  if (status === "verified") {
    updatePayload.verified_by = profile.id;
    updatePayload.verified_at = new Date().toISOString();
  } else if (status === "approved") {
    updatePayload.approved_by = profile.id;
    updatePayload.approved_at = new Date().toISOString();
  } else if (status === "rejected") {
    updatePayload.rejected_reason = reason;
  } else if (status === "released") {
    updatePayload.released_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("certification_requests")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: `certification.${status}`,
    entityType: "certification_request",
    entityId: id,
    barangayId: profile.barangay_id,
    metadata: { reason },
  });

  return { data };
}
