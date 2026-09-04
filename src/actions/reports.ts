"use server";

import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validations/report.schema";
import { logAction } from "@/lib/audit/logger";
import { notifyUser } from "@/lib/notifications/notify";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { uploadReportFile } from "@/lib/storage/upload";
import { revalidatePath } from "next/cache";

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
  status: "approved" | "returned",
  notes?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Only LGU admins and reviewers can review reports" };
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("reports")
    .select("status")
    .eq("id", id)
    .single();

  const dbStatus = status === "returned" ? "rejected" : status;

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: dbStatus,
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
    newValue: { status: dbStatus },
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

  revalidatePath("/lgu/documents/pending");
  revalidatePath("/lgu/documents/approved");
  revalidatePath("/lgu/documents/returned");
  revalidatePath("/lgu/documents/archived");
  revalidatePath("/lgu/documents/sk-pending");
  revalidatePath("/lgu/documents/sk-approved");
  revalidatePath("/lgu/documents/sk-returned");
  revalidatePath("/lgu/documents/sk-archived");
  revalidatePath("/lgu/reports");
  revalidatePath("/lgu/reports/pending");
  revalidatePath("/lgu/reports/approved");
  revalidatePath("/lgu/reports/returned");
  revalidatePath("/lgu/reports/archived");

  return { data };
}

export async function archiveReport(id: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can archive reports." };
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("reports")
    .select("status, barangay_id, title")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "archived",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "report.archived",
    entityType: "report",
    entityId: id,
    barangayId: data.barangay_id,
    oldValue: before ? { status: before.status } : undefined,
    newValue: { status: "archived" },
  });

  revalidatePath("/lgu/documents/approved");
  revalidatePath("/lgu/documents/sk-approved");
  revalidatePath("/lgu/documents/archived");
  revalidatePath("/lgu/documents/sk-archived");
  revalidatePath("/lgu/reports/approved");
  revalidatePath("/lgu/reports/archived");

  return { data };
}

export async function restoreReport(id: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can restore reports." };
  }

  const supabase = await createClient();

  const { data: before } = await supabase
    .from("reports")
    .select("status, barangay_id, title")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("reports")
    .update({
      status: "approved",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: "report.restored",
    entityType: "report",
    entityId: id,
    barangayId: data.barangay_id,
    oldValue: before ? { status: before.status } : undefined,
    newValue: { status: "approved" },
  });

  revalidatePath("/lgu/documents/approved");
  revalidatePath("/lgu/documents/sk-approved");
  revalidatePath("/lgu/documents/archived");
  revalidatePath("/lgu/documents/sk-archived");
  revalidatePath("/lgu/reports/approved");
  revalidatePath("/lgu/reports/archived");

  return { data };
}
