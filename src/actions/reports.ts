"use server";

import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validations/report.schema";
import { logAction } from "@/lib/audit/logger";
import { notifyUser } from "@/lib/notifications/notify";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { uploadReportFile } from "@/lib/storage/upload";

export async function submitReport(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official"])) {
    return { error: "Only barangay officials can submit reports" };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please select a report file to upload." };
  }

  const uploaded = await uploadReportFile(file);
  if (!uploaded) {
    return { error: "Upload failed — check the file type (PDF/Excel/CSV) and size (max 10MB)." };
  }

  const parsed = reportSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    period_start: formData.get("period_start"),
    period_end: formData.get("period_end"),
    file_url: uploaded.file_url,
    file_name: uploaded.name,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      submitted_by: profile.id,
      barangay_id: profile.barangay_id,
      type: parsed.data.type,
      title: parsed.data.title,
      period_start: parsed.data.period_start,
      period_end: parsed.data.period_end,
      file_url: parsed.data.file_url,
      file_name: parsed.data.file_name,
      status: "submitted",
    })
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "report.submitted",
    entityType: "report",
    entityId: data.id,
    barangayId: profile.barangay_id,
  });

  return { data };
}

export async function reviewReport(
  id: string,
  status: "approved" | "rejected",
  notes?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin"])) {
    return { error: "Only LGU admins can review reports" };
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("reports")
    .select("status")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("reports")
    .update({
      status,
      reviewed_by: profile.id,
      reviewed_at: new Date().toISOString(),
      review_notes: notes,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: `report.${status}`,
    entityType: "report",
    entityId: id,
    barangayId: data.barangay_id,
    metadata: { notes },
    oldValue: before ? { status: before.status } : undefined,
    newValue: { status },
  });

  // Notify the barangay official who submitted the report.
  if (data.submitted_by) {
    await notifyUser({
      recipientId: data.submitted_by,
      title: `Report ${status === "approved" ? "approved" : "returned"}`,
      message:
        status === "approved"
          ? `Your report "${data.title}" was approved by the LGU.`
          : `Your report "${data.title}" was returned.${notes ? ` Reason: ${notes}` : " Please review and resubmit."}`,
      type: "report_update",
      entityType: "report",
      entityId: id,
    });
  }

  return { data };
}
