import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { FileText, Download } from "lucide-react";

export async function DocumentList({
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
    .select("id, title, file_name, file_url, status, created_at, barangays(name)")
    .order("created_at", { ascending: false });

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  const { data: documents } = await query;

  const rows: FilterableRow[] = (documents || []).map((d) => {
    const barangay = d.barangays as unknown as { name: string } | null;
    return {
      searchText: `${d.file_name || ""} ${d.title} ${barangay?.name || ""}`,
      barangay: barangay?.name,
      cells: [
        <a
          key="file"
          href={d.file_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
        >
          <Download className="h-3 w-3" /> {d.file_name || "Download"}
        </a>,
        <span key="report" className="text-muted-foreground">{d.title}</span>,
        <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={d.status} />,
        <RowActions key="actions" id={d.id} kind="report" status={d.status} />,
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
              { label: "File" },
              { label: "Related Report" },
              { label: "Barangay" },
              { label: "Date" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<FileText />}
            emptyMessage="No document submissions in this category yet."
            searchPlaceholder="Search file or report..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
