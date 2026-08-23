import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { AlertTriangle } from "lucide-react";

export async function ComplaintList({
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
    .from("complaints")
    .select("id, subject, type, status, record_type, created_at, profiles!complaints_complainant_id_fkey(full_name), barangays(name)")
    .order("created_at", { ascending: false })
    // Hard cap — FilterableTable paginates client-side, so an unbounded
    // fetch-all would grow without limit as complaints accumulate.
    .limit(500);

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  const { data: complaints } = await query;

  const rows: FilterableRow[] = (complaints || []).map((c) => {
    const complainant = c.profiles as unknown as { full_name: string } | null;
    const barangay = c.barangays as unknown as { name: string } | null;
    const isService = c.record_type === "service_report";
    return {
      searchText: `${c.subject} ${complainant?.full_name || ""} ${barangay?.name || ""}`,
      barangay: barangay?.name,
      cells: [
        <span key="subject" className="font-medium">{c.subject}</span>,
        <span key="type" className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${isService ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"}`}>
          {isService ? "Report" : "Complaint"}
        </span>,
        <span key="complainant" className="text-muted-foreground">{complainant?.full_name || "—"}</span>,
        <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={c.status} />,
        <RowActions key="actions" id={c.id} kind="complaint" status={c.status} recordType={c.record_type} />,
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
              { label: "Subject" },
              { label: "Type" },
              { label: "Complainant" },
              { label: "Barangay" },
              { label: "Date" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<AlertTriangle />}
            emptyMessage="No complaints in this category yet."
            searchPlaceholder="Search subject or complainant..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
