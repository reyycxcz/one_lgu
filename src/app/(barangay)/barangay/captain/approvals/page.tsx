import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { DEPARTMENT_LABELS, type LguDepartment } from "@/lib/auth/departments";
import { BadgeCheck, Download, ExternalLink } from "lucide-react";
import { getFileViewUrl } from "@/lib/storage/file-url";

export default async function CaptainApprovalsPage() {
  const profile = await requireBarangaySection("approvals");
  const supabase = await createClient();

  const isSk = profile.position === "sk_chairman";

  const { data: submissions } = await supabase
    .from("document_submissions")
    .select(`
      id, file_name, file_url, status, submitted_at, remarks,
      profiles!document_submissions_submitted_by_fkey(full_name, position),
      document_requests(title, requesting_department_id)
    `)
    .eq("barangay_id", profile.barangay_id || "")
    .eq("status", "pending_captain_approval")
    .order("submitted_at", { ascending: false });

  const filteredSubmissions = (submissions || []).filter((s) => {
    const submitter = s.profiles as unknown as { full_name: string; position: string } | null;
    const submitterPosition = submitter?.position || "";
    const isSkSubmitter = ["sk_chairman", "sk_secretary", "sk_treasurer"].includes(submitterPosition);
    return isSk ? isSkSubmitter : !isSkSubmitter;
  });

  const rows: FilterableRow[] = filteredSubmissions.map((s) => {
    const submitter = s.profiles as unknown as { full_name: string } | null;
    const request = s.document_requests as unknown as { title: string; requesting_department_id: string } | null;
    const departmentLabel = request?.requesting_department_id
      ? (DEPARTMENT_LABELS[request.requesting_department_id as LguDepartment] || request.requesting_department_id)
      : "LGU Department";

    return {
      searchText: `${request?.title || ""} ${submitter?.full_name || ""} ${departmentLabel}`,
      cells: [
        <span key="title" className="font-medium">{request?.title || "Document Response"}</span>,
        <span key="department" className="text-muted-foreground">{departmentLabel}</span>,
        <span key="submitter" className="text-muted-foreground">{submitter?.full_name || "—"}</span>,
        <a
          key="file"
          href={getFileViewUrl(s.file_url, s.file_name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" /> {s.file_name || "View File"}
        </a>,
        <span key="date" className="text-muted-foreground">
          {new Date(s.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={s.status} />,
        <RowActions key="actions" id={s.id} kind="workflow_submission" status={s.status} />,
      ],
    };
  });

  const assistantLabel = isSk ? "Secretary or Treasurer" : "Secretary";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Document Approvals</h1>
        <p className="text-sm text-foreground/60 mt-1">
          Documents your {assistantLabel} prepared, awaiting your sign-off before they&apos;re sent to the requesting LGU department.
        </p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Request" },
            { label: "Department" },
            { label: "Prepared By" },
            { label: "File" },
            { label: "Date" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<BadgeCheck />}
          emptyMessage="Nothing awaiting your approval right now."
          searchPlaceholder="Search request, submitter, or department..."
        />
      </div>
    </div>
  );
}
