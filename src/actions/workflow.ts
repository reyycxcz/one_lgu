"use server";

import { createClient } from "@/lib/supabase/server";
import { logAction } from "@/lib/audit/logger";
import { requireProfile } from "@/lib/auth/session";
import { hasRole } from "@/lib/auth/rbac";
import { uploadReportFile } from "@/lib/storage/upload";
import { getDepartmentDocumentTypes } from "@/lib/documents/request-types";
import { revalidatePath } from "next/cache";

export async function createDocumentRequestAction(
  title: string,
  description: string,
  deadline: string,
  options: {
    documentType?: string;
    // "one_time" | "monthly" | "quarterly" | "annual" — kept as a plain
    // string here (not imported from taxonomy) since server actions can't
    // export non-async values, matching the CHECK constraint in migration
    // 0017 rather than a hard TS union.
    recurrence?: string;
    // Set when this request is a new cycle of an existing recurring
    // series (via "Create Next Period") — reuses the original series'
    // recurrence_group_id so all cycles stay linked. Omit for a fresh,
    // standalone request; the column defaults to a new group id.
    recurrenceGroupId?: string;
    targetBarangays?: string[];
    targetAudience?: "barangay_official" | "sk_official" | "both";
  } = {}
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can create document requests." };
  }

  // Backstop for the UI restriction on the department dashboard's
  // quick-create sheet and the full Create Document Request page — a
  // department-scoped lgu_reviewer can't dispatch a type outside their
  // department's list by editing the form or calling this action
  // directly. super_admin (or an lgu_reviewer with no department, which
  // shouldn't normally happen) is unrestricted.
  if (profile.role === "lgu_reviewer" && profile.department) {
    const allowed = getDepartmentDocumentTypes(profile.department);
    const requestedType = options.documentType || "other";
    if (requestedType !== "other" && !allowed.includes(requestedType)) {
      return { error: "That document type isn't available to your department." };
    }
  }

  const departmentId = profile.department || "super_admin";
  const supabase = await createClient();

  // 1. Insert Request
  const { data: request, error: reqError } = await supabase
    .from("document_requests")
    .insert({
      requesting_department_id: departmentId,
      title,
      description: description || null,
      deadline,
      document_type: options.documentType || null,
      recurrence: options.recurrence || "one_time",
      target_audience: options.targetAudience || "both",
      ...(options.recurrenceGroupId ? { recurrence_group_id: options.recurrenceGroupId } : {}),
      created_by: profile.id,
      status: "active",
    })
    .select()
    .single();

  if (reqError) {
    return { error: reqError.message };
  }

  // Determine target barangays
  let targets = options.targetBarangays || [];
  if (targets.length === 0) {
    const { data: bList } = await supabase
      .from("barangays")
      .select("id")
      .eq("is_active", true);
    targets = (bList || []).map((b) => b.id);
  }

  // 2. Insert Recipients
  const recipients = targets.map((bId) => ({
    request_id: request.id,
    barangay_id: bId,
  }));

  const { error: recError } = await supabase
    .from("request_recipients")
    .insert(recipients);

  if (recError) {
    // Clean up request on recipient insert error
    await supabase.from("document_requests").delete().eq("id", request.id);
    return { error: recError.message };
  }

  // 3. Notify Target Barangay Officials
  const { data: officials } = await supabase
    .from("profiles")
    .select("id, barangay_id")
    .in("barangay_id", targets)
    .eq("role", "barangay_official")
    .eq("is_active", true);

  if (officials && officials.length > 0) {
    await supabase.from("notifications").insert(
      officials.map((off) => ({
        recipient_id: off.id,
        title: `Document Request: ${title}`,
        message: `${description || "Submission requested"}. Deadline: ${new Date(deadline).toLocaleDateString()}`,
        type: "document_request",
        entity_type: "document_request",
        entity_id: request.id,
      }))
    );
  }

  // 4. Log Action
  await logAction({
    actorId: profile.id,
    action: "document_request.created",
    entityType: "document_request",
    entityId: request.id,
    metadata: {
      title,
      department: departmentId,
      recipientCount: targets.length,
    },
  });

  revalidatePath("/lgu/requests/active");
  revalidatePath("/barangay/compliance");
  return { data: request };
}

export async function submitDocumentResponseAction(formData: FormData) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official"])) {
    return { error: "Access Denied: Only barangay officials can submit responses." };
  }

  const requestId = formData.get("requestId") as string;
  if (!requestId) return { error: "Missing document request ID." };

  const supabase = await createClient();

  // 1. Verify if this barangay is an assigned recipient
  const { data: recipient, error: recError } = await supabase
    .from("request_recipients")
    .select("id")
    .eq("request_id", requestId)
    .eq("barangay_id", profile.barangay_id || "")
    .maybeSingle();

  if (recError || !recipient) {
    return { error: "Access Denied: This document request is not addressed to your barangay." };
  }

  // 2. Upload file
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Please select a file to upload." };
  }

  const uploaded = await uploadReportFile(file);
  if (!uploaded) {
    return { error: "File upload failed. Allowed types: PDF, Excel, CSV (max 10MB)." };
  }

  // 3. Upsert submission — goes to the Captain first, not straight to the
  // requesting department. It only becomes "submitted" (department-visible)
  // once the Captain signs off, in captainDecisionAction below.
  const { data: submission, error: subError } = await supabase
    .from("document_submissions")
    .upsert({
      request_id: requestId,
      barangay_id: profile.barangay_id,
      file_name: uploaded.name,
      file_url: uploaded.file_url,
      status: "pending_captain_approval",
      submitted_by: profile.id,
      submitted_at: new Date().toISOString(),
      remarks: (formData.get("remarks") as string) || null,
    }, {
      onConflict: "request_id,barangay_id"
    })
    .select()
    .single();

  if (subError) {
    return { error: subError.message };
  }

  // 4. Notify this barangay's Captain (or an unrestricted/legacy position —
  // same "who can approve" rule captainDecisionAction enforces) that a
  // document is awaiting their sign-off.
  const { data: request } = await supabase
    .from("document_requests")
    .select("title")
    .eq("id", requestId)
    .single();

  const { data: approvers } = await supabase
    .from("profiles")
    .select("id, position")
    .eq("barangay_id", profile.barangay_id || "")
    .eq("role", "barangay_official")
    .eq("is_active", true);

  const isSkSubmitter = ["sk_chairman", "sk_secretary", "sk_treasurer"].includes(profile.position || "");
  const targetApproverPosition = isSkSubmitter ? "sk_chairman" : "captain";

  const approverIds = (approvers || [])
    .filter((a) => {
      if (isSkSubmitter) {
        return a.position === "sk_chairman";
      } else {
        return !a.position || a.position === "captain";
      }
    })
    .map((a) => a.id);

  if (request && approverIds.length > 0) {
    const approverLabel = isSkSubmitter ? "SK Chairman" : "Captain";
    await supabase.from("notifications").insert(
      approverIds.map((recId) => ({
        recipient_id: recId,
        title: `Awaiting your approval: ${request.title}`,
        message: `${profile.full_name} prepared a document response and needs your sign-off before it's sent to the LGU.`,
        type: "captain_approval_needed",
        entity_type: "document_submission",
        entity_id: submission.id,
      }))
    );
  }

  // 5. Log Action
  await logAction({
    actorId: profile.id,
    action: isSkSubmitter ? "document_submission.sent_to_sk_chairman" : "document_submission.sent_to_captain",
    entityType: "document_submission",
    entityId: submission.id,
    barangayId: profile.barangay_id,
  });

  revalidatePath("/barangay/compliance");
  revalidatePath("/barangay/captain/approvals");
  revalidatePath("/barangay/reports");
  revalidatePath("/barangay/documents");
  revalidatePath("/lgu/documents/returned");
  revalidatePath("/lgu/documents/sk-returned");
  return { data: submission };
}

/**
 * Barangay Captain approves or returns a document the Secretary sent up.
 * Approving flips it to 'submitted' — only then does it actually reach the
 * requesting department (mirrors the department notification
 * submitDocumentResponseAction used to send at upload time, before this
 * gate existed). Returning sends it back to the Secretary with the
 * Captain's notes; no submission_reviews row is created for a Captain-level
 * return, which is how the barangay UI tells "returned by your Captain"
 * apart from "returned by the department" (submission_reviews IS written
 * for the latter, in reviewSubmissionAction below).
 */
export async function captainDecisionAction(
  submissionId: string,
  decision: "approved" | "returned",
  notes?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["barangay_official"])) {
    return { error: "Access Denied: Only barangay officials can approve documents." };
  }

  const allowedPositions = ["captain", "sk_chairman"];
  if (profile.position && !allowedPositions.includes(profile.position)) {
    return { error: "Access Denied: Only the Barangay Captain or SK Chairman can approve or return documents." };
  }

  const supabase = await createClient();

  const { data: submission, error: subError } = await supabase
    .from("document_submissions")
    .select(`
      *,
      document_requests(title, requesting_department_id),
      submitter:profiles!document_submissions_submitted_by_fkey(position)
    `)
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }

  if (submission.barangay_id !== profile.barangay_id) {
    return { error: "Access Denied: This submission is not from your barangay." };
  }

  const submitterPosition = (submission.submitter as any)?.position || "";
  const isSkSubmitter = ["sk_chairman", "sk_secretary", "sk_treasurer"].includes(submitterPosition);

  if (isSkSubmitter) {
    if (profile.position && profile.position !== "sk_chairman") {
      return { error: "Access Denied: Only the SK Chairman can approve SK submissions." };
    }
  } else {
    if (profile.position && profile.position !== "captain") {
      return { error: "Access Denied: Only the Barangay Captain can approve Barangay submissions." };
    }
  }

  if (submission.status !== "pending_captain_approval") {
    return { error: "This document is not currently awaiting your approval." };
  }

  const newStatus = decision === "approved" ? "submitted" : "returned";

  const { error: updateError } = await supabase
    .from("document_submissions")
    .update({
      status: newStatus,
      captain_approved_by: profile.id,
      captain_approved_at: new Date().toISOString(),
      captain_notes: notes || null,
    })
    .eq("id", submissionId);

  if (updateError) {
    return { error: updateError.message };
  }

  const request = submission.document_requests as unknown as { title: string; requesting_department_id: string } | null;

  if (decision === "approved" && request) {
    // Now actually reaches the requesting department — this is the
    // notification that used to fire at upload time.
    const recipientIds: string[] = [];

    const { data: reviewers } = await supabase
      .from("profiles")
      .select("id")
      .eq("department", request.requesting_department_id)
      .eq("role", "lgu_reviewer");
    if (reviewers) recipientIds.push(...reviewers.map((r) => r.id));

    const { data: admins } = await supabase.from("profiles").select("id").eq("role", "super_admin");
    if (admins) recipientIds.push(...admins.map((a) => a.id));

    const uniqueRecipients = Array.from(new Set(recipientIds));

    if (uniqueRecipients.length > 0) {
      const { data: brgy } = await supabase.from("barangays").select("name").eq("id", profile.barangay_id || "").single();

      await supabase.from("notifications").insert(
        uniqueRecipients.map((recId) => ({
          recipient_id: recId,
          title: `New Submission: ${request.title}`,
          message: `${brgy?.name || "A Barangay"} submitted a document response.`,
          type: "document_submission",
          entity_type: "document_submission",
          entity_id: submission.id,
        }))
      );
    }
  }

  // Tell the Secretary/submitter who prepared it either way — approved-and-forwarded,
  // or returned with the notes for revision.
  const officialLabel = isSkSubmitter ? "SK Chairman" : "Captain";

  if (submission.submitted_by) {
    await supabase.from("notifications").insert({
      recipient_id: submission.submitted_by,
      title: decision === "approved" 
        ? `Approved & forwarded: ${request?.title || "Document"}` 
        : `Returned by your ${officialLabel}: ${request?.title || "Document"}`,
      message:
        decision === "approved"
          ? `Your ${officialLabel} approved this document — it's been forwarded to the requesting department.`
          : `Your ${officialLabel} returned this document for revision.${notes ? ` Notes: ${notes}` : ""}`,
      type: "captain_decision",
      entity_type: "document_submission",
      entity_id: submissionId,
    });
  }

  await logAction({
    actorId: profile.id,
    action: isSkSubmitter ? `document_submission.sk_chairman_${decision}` : `document_submission.captain_${decision}`,
    entityType: "document_submission",
    entityId: submissionId,
    barangayId: submission.barangay_id,
    metadata: { notes },
  });

  revalidatePath("/barangay/captain/approvals");
  revalidatePath("/barangay/compliance");
  revalidatePath("/barangay/reports");
  revalidatePath("/barangay/documents");
  revalidatePath("/lgu/documents/pending");
  revalidatePath("/lgu/documents/returned");
  revalidatePath("/lgu/documents/sk-pending");
  revalidatePath("/lgu/documents/sk-returned");
  return { data: true };
}

export async function reviewSubmissionAction(
  submissionId: string,
  status: "approved" | "returned" | "resubmission_required",
  notes?: string
) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can perform reviews." };
  }

  const supabase = await createClient();

  // 1. Get submission and request details to verify department ownership
  const { data: submission, error: subError } = await supabase
    .from("document_submissions")
    .select("*, document_requests(*)")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }

  const request = submission.document_requests as any;

  if (submission.status === "pending_captain_approval") {
    return { error: "This document hasn't been approved by the barangay Captain yet." };
  }

  if (profile.role !== "super_admin" && request.requesting_department_id !== profile.department) {
    return { error: "Access Denied: You do not have permission to review this department request submission." };
  }

  // 2. Insert Review Record
  const { error: revError } = await supabase
    .from("submission_reviews")
    .insert({
      submission_id: submissionId,
      reviewed_by: profile.id,
      status,
      review_notes: notes || null,
    });

  if (revError) {
    return { error: revError.message };
  }

  // 3. Update Submission Status
  const { error: updateError } = await supabase
    .from("document_submissions")
    .update({
      status,
    })
    .eq("id", submissionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 4. Notify Barangay Official
  if (submission.submitted_by) {
    await supabase.from("notifications").insert({
      recipient_id: submission.submitted_by,
      title: `Submission for ${request.title} is ${status}`,
      message: `Your submission has been marked as ${status}.${notes ? ` Remarks: ${notes}` : ""}`,
      type: "submission_review",
      entity_type: "document_submission",
      entity_id: submissionId,
    });
  }

  // 5. Log Action
  await logAction({
    actorId: profile.id,
    action: `document_submission.${status}`,
    entityType: "document_submission",
    entityId: submissionId,
    barangayId: submission.barangay_id,
    metadata: { notes },
  });

  revalidatePath("/lgu/documents/pending");
  return { data: true };
}

export async function archiveSubmissionAction(submissionId: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can archive submissions." };
  }

  const supabase = await createClient();

  // 1. Get submission and request details to verify department ownership
  const { data: submission, error: subError } = await supabase
    .from("document_submissions")
    .select("*, document_requests(*)")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }

  const request = submission.document_requests as any;

  if (profile.role !== "super_admin" && request?.requesting_department_id !== profile.department) {
    return { error: "Access Denied: You do not have permission to archive this submission." };
  }

  // 2. Update Submission Status
  const { error: updateError } = await supabase
    .from("document_submissions")
    .update({
      status: "archived",
    })
    .eq("id", submissionId);

  if (updateError) {
    if (updateError.message.includes("chk_submission_status")) {
      return {
        error: "Database constraint error: Please run migration 0021_allow_archived_submissions.sql in Supabase to enable archiving document submissions.",
      };
    }
    return { error: updateError.message };
  }

  // 3. Log Action
  await logAction({
    actorId: profile.id,
    action: "document_submission.archived",
    entityType: "document_submission",
    entityId: submissionId,
    barangayId: submission.barangay_id,
  });

  revalidatePath("/lgu/documents/approved");
  revalidatePath("/lgu/documents/sk-approved");
  revalidatePath("/lgu/documents/archived");
  revalidatePath("/lgu/documents/sk-archived");
  revalidatePath("/barangay/documents");
  return { data: true };
}

export async function restoreSubmissionAction(submissionId: string) {
  const profile = await requireProfile();

  if (!hasRole(profile.role, ["super_admin", "lgu_reviewer"])) {
    return { error: "Access Denied: Only LGU admins and reviewers can restore submissions." };
  }

  const supabase = await createClient();

  // 1. Get submission and request details to verify department ownership
  const { data: submission, error: subError } = await supabase
    .from("document_submissions")
    .select("*, document_requests(*)")
    .eq("id", submissionId)
    .single();

  if (subError || !submission) {
    return { error: "Submission not found." };
  }

  const request = submission.document_requests as any;

  if (profile.role !== "super_admin" && request?.requesting_department_id !== profile.department) {
    return { error: "Access Denied: You do not have permission to restore this submission." };
  }

  // 2. Update Submission Status
  const { error: updateError } = await supabase
    .from("document_submissions")
    .update({
      status: "approved",
    })
    .eq("id", submissionId);

  if (updateError) {
    return { error: updateError.message };
  }

  // 3. Log Action
  await logAction({
    actorId: profile.id,
    action: "document_submission.restored",
    entityType: "document_submission",
    entityId: submissionId,
    barangayId: submission.barangay_id,
  });

  revalidatePath("/lgu/documents/approved");
  revalidatePath("/lgu/documents/sk-approved");
  revalidatePath("/lgu/documents/archived");
  revalidatePath("/lgu/documents/sk-archived");
  revalidatePath("/barangay/documents");
  return { data: true };
}
