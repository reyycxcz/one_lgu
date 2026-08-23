"use server";

import { createClient } from "@/lib/supabase/server";
import { complaintSchema } from "@/lib/validations/complaint.schema";
import { logAction } from "@/lib/audit/logger";
import { notifyUser, notifyBarangayOfficials } from "@/lib/notifications/notify";
import { uploadAttachments } from "@/lib/storage/upload";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { nextStatusesFor, STATUS_LABELS, type ComplaintRecordType, type ComplaintStatus } from "@/lib/complaints/taxonomy";

// Human-friendly resident-facing message per new status — shared vocabulary
// works for both record types; the action/message wrapper below picks
// "report" vs "complaint" phrasing based on record_type.
const COMPLAINT_STATUS_MESSAGE: Record<string, string> = {
  under_review: "is now under review",
  assigned: "has been assigned to the responsible barangay personnel/unit",
  in_progress: "is currently being acted on",
  resolved: "has been resolved",
  rejected: "was reviewed and marked not applicable",
  closed: "has been closed",
  notice_summons: "has had a notice issued to the concerned party",
  scheduled: "has a mediation hearing scheduled",
  mediation: "has entered mediation",
  pangkat_conciliation: "has been referred to Pangkat conciliation",
  settled: "has been settled",
  not_settled: "was not settled through mediation — the barangay will determine the next step",
};

export async function submitComplaint(formData: FormData) {
  const profile = await requireProfile();

  // Upload any evidence (photos, documents) server-side.
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const uploaded = await uploadAttachments(files);
  const attachments = uploaded.map((u) => ({
    type: u.name.toLowerCase().endsWith(".pdf") ? "document" : "image",
    file_url: u.file_url,
    uploaded_at: u.uploaded_at,
  }));

  const parsed = complaintSchema.safeParse({
    record_type: formData.get("record_type"),
    type: formData.get("type"),
    respondent_name: formData.get("respondent_name") || undefined,
    subject: formData.get("subject"),
    description: formData.get("description"),
    location: formData.get("location") || undefined,
    incident_at: formData.get("incident_at") || undefined,
    priority: formData.get("priority") || undefined,
    is_anonymous: formData.get("is_anonymous"),
    attachments,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const insertPayload: Record<string, unknown> = {
    complainant_id: profile.id,
    barangay_id: profile.barangay_id,
    record_type: parsed.data.record_type,
    type: parsed.data.type,
    subject: parsed.data.subject,
    description: parsed.data.description,
    attachments: parsed.data.attachments,
    status: "submitted",
  };

  if (parsed.data.record_type === "formal_complaint") {
    insertPayload.respondent_name = parsed.data.respondent_name;
  } else {
    insertPayload.location = parsed.data.location || null;
    insertPayload.incident_at = parsed.data.incident_at || null;
    insertPayload.priority = parsed.data.priority || "medium";
    insertPayload.is_anonymous = parsed.data.is_anonymous || false;
  }

  const { data, error } = await supabase.from("complaints").insert(insertPayload).select().single();

  if (error) return { error: error.message };

  const isService = parsed.data.record_type === "service_report";

  await logAction({
    actorId: profile.id,
    action: isService ? "complaint.service_report_submitted" : "complaint.formal_complaint_submitted",
    entityType: "complaint",
    entityId: data.id,
    barangayId: profile.barangay_id,
  });

  if (profile.barangay_id) {
    await notifyBarangayOfficials({
      barangayId: profile.barangay_id,
      title: isService ? "New community report" : "New complaint filed",
      message: `${profile.full_name || "A resident"} filed ${isService ? "a community report" : "a formal complaint"}: "${parsed.data.subject}".`,
      type: "complaint_update",
      entityType: "complaint",
      entityId: data.id,
    });
  }

  return { data };
}

interface UpdateComplaintOptions {
  notes?: string;
  scheduledDate?: string;
  assignedToId?: string;
  assignedToLabel?: string;
  noticeDetails?: string;
  pangkatMembers?: string;
}

export async function updateComplaintStatus(
  id: string,
  status: string,
  options: UpdateComplaintOptions = {}
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official", "super_admin"])) {
    return { error: "Insufficient permissions" };
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("complaints")
    .select("status, record_type, complainant_id, subject")
    .eq("id", id)
    .single();

  if (!before) return { error: "Complaint not found" };

  // The DB constraint is the hard backstop; this just gives a clean error
  // instead of a raw Postgres exception, and stops an out-of-order jump
  // (e.g. straight to "settled" from "submitted" without ever reviewing it).
  const allowed = nextStatusesFor(before.record_type as ComplaintRecordType, before.status as ComplaintStatus);
  if (!allowed.includes(status as ComplaintStatus)) {
    const from = STATUS_LABELS[before.status as ComplaintStatus] || before.status;
    const to = STATUS_LABELS[status as ComplaintStatus] || status;
    return { error: `Cannot move from "${from}" to "${to}".` };
  }

  const updatePayload: Record<string, unknown> = { status };

  if (status === "assigned") {
    if (!options.assignedToLabel && !options.assignedToId) {
      return { error: "Specify who or which unit this is assigned to." };
    }
    updatePayload.assigned_to = options.assignedToId || profile.id;
    updatePayload.assigned_to_label = options.assignedToLabel || null;
    updatePayload.assigned_at = new Date().toISOString();
  } else if (status === "rejected") {
    updatePayload.rejected_reason = options.notes || null;
  } else if (status === "notice_summons") {
    updatePayload.notice_issued_at = new Date().toISOString();
    updatePayload.notice_details = options.noticeDetails || options.notes || null;
  } else if (status === "scheduled") {
    if (!options.scheduledDate) return { error: "A hearing date is required to schedule mediation." };
    updatePayload.scheduled_date = options.scheduledDate;
  } else if (status === "mediation") {
    updatePayload.mediation_notes = options.notes || null;
  } else if (status === "pangkat_conciliation") {
    updatePayload.pangkat_members = options.pangkatMembers || null;
    updatePayload.pangkat_notes = options.notes || null;
  } else if (status === "settled" || status === "resolved" || status === "not_settled") {
    updatePayload.resolution = options.notes || null;
    if (status !== "not_settled") updatePayload.resolved_at = new Date().toISOString();
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
    metadata: { ...options },
    oldValue: { status: before.status },
    newValue: { status },
  });

  // Notify the complainant of the status change.
  const statusPhrase = COMPLAINT_STATUS_MESSAGE[status];
  if (data.complainant_id && statusPhrase) {
    const isService = data.record_type === "service_report";
    const dateNote = status === "scheduled" && options.scheduledDate
      ? ` Hearing date: ${new Date(options.scheduledDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
      : "";
    await notifyUser({
      recipientId: data.complainant_id,
      title: isService ? "Report update" : "Complaint update",
      message: `Your ${isService ? "report" : "complaint"} "${data.subject}" ${statusPhrase}.${dateNote}${options.notes ? ` Note: ${options.notes}` : ""}`,
      type: "complaint_update",
      entityType: "complaint",
      entityId: id,
    });
  }

  return { data };
}
