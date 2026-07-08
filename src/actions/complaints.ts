"use server";

import { createClient } from "@/lib/supabase/server";
import { complaintSchema } from "@/lib/validations/complaint.schema";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

export async function submitComplaint(formData: FormData) {
  const profile = await requireProfile();

  const parsed = complaintSchema.safeParse({
    respondent_name: formData.get("respondent_name") || undefined,
    subject: formData.get("subject"),
    description: formData.get("description"),
    attachments: JSON.parse((formData.get("attachments") as string) || "[]"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      complainant_id: profile.id,
      barangay_id: profile.barangay_id,
      respondent_name: parsed.data.respondent_name,
      subject: parsed.data.subject,
      description: parsed.data.description,
      attachments: parsed.data.attachments,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "complaint.submitted",
    entityType: "complaint",
    entityId: data.id,
    barangayId: profile.barangay_id,
  });

  return { data };
}

export async function updateComplaintStatus(
  id: string,
  status: string,
  notes?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official", "super_admin"])) {
    return { error: "Insufficient permissions" };
  }

  const supabase = createClient();

  const updatePayload: Record<string, unknown> = { status };

  if (status === "under_review") {
    updatePayload.assigned_to = profile.id;
    updatePayload.assigned_at = new Date().toISOString();
  } else if (status === "resolved") {
    updatePayload.resolution = notes;
    updatePayload.resolved_at = new Date().toISOString();
  } else if (status === "closed") {
    updatePayload.closed_by = profile.id;
    updatePayload.closed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("complaints")
    .update(updatePayload)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: `complaint.${status}`,
    entityType: "complaint",
    entityId: id,
    barangayId: profile.barangay_id,
    metadata: { notes },
  });

  return { data };
}
