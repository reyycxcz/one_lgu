"use server";

import { createClient } from "@/lib/supabase/server";
import { certificationRequestSchema } from "@/lib/validations/certification.schema";
import { logAction } from "@/lib/audit/logger";
import { notifyUser, notifyBarangayOfficials } from "@/lib/notifications/notify";
import { uploadAttachments } from "@/lib/storage/upload";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";

const CERT_TYPE_LABELS: Record<string, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  business_clearance: "Business Clearance",
  first_time_job_seeker: "First-Time Job Seeker Certificate",
};

// Human-friendly resident-facing message per new status.
const CERT_STATUS_MESSAGE: Record<string, string> = {
  verified: "has been verified and is being processed",
  approved: "has been approved",
  rejected: "was rejected",
  released: "is ready — you may now claim it or download it",
  generated: "has been generated",
  ready_for_pickup: "is ready for pickup at your Barangay Hall",
};

export async function submitCertificationRequest(formData: FormData) {
  const profile = await requireProfile();

  // Upload any attached requirement files (valid IDs, proofs) server-side.
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const requirements = await uploadAttachments(files);

  const parsed = certificationRequestSchema.safeParse({
    type: formData.get("type"),
    purpose: formData.get("purpose"),
    requirements,
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

  if (profile.barangay_id) {
    const typeLabel = CERT_TYPE_LABELS[parsed.data.type] || parsed.data.type.replace(/_/g, " ");
    await notifyBarangayOfficials({
      barangayId: profile.barangay_id,
      title: "New certification request",
      message: `${profile.full_name || "A resident"} submitted a ${typeLabel} request.`,
      type: "certification_update",
      entityType: "certification_request",
      entityId: data.id,
    });
  }

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

  const { data: before } = await supabase
    .from("certification_requests")
    .select("status")
    .eq("id", id)
    .single();

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
    .select("*, requester:profiles!certification_requests_requester_id_fkey(id)")
    .single();

  if (error) return { error: error.message };

  await logAction({
    actorId: profile.id,
    action: `certification.${status}`,
    entityType: "certification_request",
    entityId: id,
    barangayId: profile.barangay_id,
    metadata: { reason },
    oldValue: before ? { status: before.status } : undefined,
    newValue: { status },
  });

  // Notify the requesting resident of the status change.
  const requesterId = (data.requester as { id: string } | null)?.id ?? data.requester_id;
  const statusPhrase = CERT_STATUS_MESSAGE[status];
  if (requesterId && statusPhrase) {
    const typeLabel = CERT_TYPE_LABELS[data.type] || (data.type as string).replace(/_/g, " ");
    await notifyUser({
      recipientId: requesterId,
      title: `${typeLabel} ${status === "rejected" ? "rejected" : "update"}`,
      message: `Your ${typeLabel} request ${statusPhrase}.${reason ? ` Reason: ${reason}` : ""}`,
      type: "certification_update",
      entityType: "certification_request",
      entityId: id,
    });
  }

  return { data };
}
