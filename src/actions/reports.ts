"use server";

import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validations/report.schema";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

export async function submitReport(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official", "sk_official"])) {
    return { error: "Only barangay officials can submit reports" };
  }

  const parsed = reportSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    period_start: formData.get("period_start"),
    period_end: formData.get("period_end"),
    file_url: formData.get("file_url"),
    file_name: formData.get("file_name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = createClient();

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

  const supabase = createClient();

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
  });

  return { data };
}
