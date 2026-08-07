"use server";

import { createClient } from "@/lib/supabase/server";
import { complaintSchema } from "@/lib/validations/complaint.schema";
import { logAction } from "@/lib/audit/logger";
import { notifyUser, notifyBarangayOfficials } from "@/lib/notifications/notify";
import { uploadAttachments } from "@/lib/storage/upload";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

// Human-friendly resident-facing message per new complaint status.
const COMPLAINT_STATUS_MESSAGE: Record<string, string> = {
  under_review: "is now under review by a barangay mediator",
  scheduled: "has a mediation hearing scheduled",
  mediation: "has entered mediation",
  resolved: "has been resolved",
  closed: "has been closed",
};

export async function submitComplaint(formData: FormData) {
  const profile = await requireProfile();

  // Upload any complaint evidence (photos, documents) server-side.
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const uploaded = await uploadAttachments(files);
  const attachments = uploaded.map((u) => ({
    type: u.name.toLowerCase().endsWith(".pdf") ? "document" : "image",
    file_url: u.file_url,
    uploaded_at: u.uploaded_at,
  }));

  const parsed = complaintSchema.safeParse({
    type: formData.get("type"),
    respondent_name: formData.get("respondent_name") || undefined,
    subject: formData.get("subject"),
    description: formData.get("description"),
    attachments,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("complaints")
    .insert({
      complainant_id: profile.id,
      barangay_id: profile.barangay_id,
      type: parsed.data.type,
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

  if (profile.barangay_id) {
    await notifyBarangayOfficials({
      barangayId: profile.barangay_id,
      title: "New complaint filed",
      message: `${profile.full_name || "A resident"} filed a complaint: "${parsed.data.subject}".`,
      type: "complaint_update",
      entityType: "complaint",
      entityId: data.id,
    });
  }

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

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("complaints")
    .select("status")
    .eq("id", id)
    .single();

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
    oldValue: before ? { status: before.status } : undefined,
    newValue: { status },
  });

  // Notify the complainant of the status change.
  const statusPhrase = COMPLAINT_STATUS_MESSAGE[status];
  if (data.complainant_id && statusPhrase) {
    await notifyUser({
      recipientId: data.complainant_id,
      title: "Complaint update",
      message: `Your complaint "${data.subject}" ${statusPhrase}.${notes ? ` Note: ${notes}` : ""}`,
      type: "complaint_update",
      entityType: "complaint",
      entityId: id,
    });
  }

  return { data };
}
