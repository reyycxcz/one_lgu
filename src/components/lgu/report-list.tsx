import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { FileText } from "lucide-react";

export async function ReportList({
  title,
  description,
  statuses,
}: {
  title: string;
  description: string;
  statuses?: string[];
}) {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("id, title, type, status, created_at, profiles!reports_submitted_by_fkey(full_name), barangays(name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (statuses && statuses.length > 0) {
    const validReportStatuses = new Set(["submitted", "under_review", "approved", "rejected", "archived"]);
    const mappedStatuses = Array.from(
      new Set(
        statuses
          .map((s) => (s === "returned" ? "rejected" : s))
          .filter((s) => validReportStatuses.has(s))
      )
    );
    if (mappedStatuses.length > 0) {
      query = query.in("status", mappedStatuses);
    }
  }

  const { data: reports } = await query;

  const rows: FilterableRow[] = (reports || []).map((r) => {
    const submitter = r.profiles as unknown as { full_name: string } | null;
    const barangay = r.barangays as unknown as { name: string } | null;
    return {
      searchText: `${r.title} ${r.type} ${submitter?.full_name || ""} ${barangay?.name || ""}`,
      barangay: barangay?.name,
      cells: [
        <span key="title" className="font-medium">{r.title}</span>,
        <span key="type" className="text-muted-foreground capitalize">{r.type}</span>,
        <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
        <span key="submitter" className="text-muted-foreground">{submitter?.full_name || "—"}</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={r.status === "rejected" ? "returned" : r.status} />,
        <RowActions key="actions" id={r.id} kind="report" status={r.status} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <LguPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "Title" },
              { label: "Type" },
              { label: "Barangay" },
              { label: "Submitted By" },
              { label: "Date" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<FileText />}
            emptyMessage="No reports in this category yet."
            searchPlaceholder="Search title or type..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
