import type { ComponentProps } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth/session";
import { LguPageHeader } from "@/components/lgu/page-header";
import { RequestDocumentForm } from "@/components/lgu/request-document-form";
import { suggestNextDeadline, getDepartmentDocumentTypes } from "@/lib/documents/request-types";

export default async function CreateRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const profile = await requireRole(["super_admin", "lgu_reviewer"]);
  const { from } = await searchParams;
  const supabase = await createClient();

  // super_admin isn't scoped to a department, so it keeps the full list —
  // a department-scoped lgu_reviewer gets the same restriction here as on
  // their dashboard's quick-create sheet, so this page can't be used to
  // route around it.
  const allowedTypes = profile.role === "lgu_reviewer" && profile.department
    ? getDepartmentDocumentTypes(profile.department)
    : undefined;

  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  let prefill: ComponentProps<typeof RequestDocumentForm>["prefill"];

  if (from) {
    const { data: source } = await supabase
      .from("document_requests")
      .select("title, description, document_type, recurrence, recurrence_group_id, deadline")
      .eq("id", from)
      .maybeSingle();

    if (source) {
      prefill = {
        title: source.title,
        description: source.description || undefined,
        documentType: source.document_type || undefined,
        recurrence: source.recurrence,
        deadline: suggestNextDeadline(source.deadline, source.recurrence) || undefined,
        recurrenceGroupId: source.recurrence_group_id,
      };
    }
  }

  return (
    <div className="space-y-6 animate-stagger-in">
      <LguPageHeader
        title={prefill ? "Create Next Period" : "Create Document Request"}
        description={
          prefill
            ? "Starting a new cycle of this recurring request, pre-filled from the previous one."
            : "Dispatch a document requirement to all active barangays. Officials will be notified and can submit the requested file directly."
        }
      />
      <RequestDocumentForm prefill={prefill} allowedTypes={allowedTypes} barangays={barangays || []} />
    </div>
  );
}
