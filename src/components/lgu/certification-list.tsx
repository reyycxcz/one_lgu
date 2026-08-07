import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { FileText } from "lucide-react";

export async function CertificationList({
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
    .from("certification_requests")
    .select("id, type, purpose, status, created_at, profiles!certification_requests_requester_id_fkey(full_name), barangays(name)")
    .order("created_at", { ascending: false })
    .limit(500);

  if (statuses && statuses.length > 0) {
    query = query.in("status", statuses);
  }

  const { data: requests } = await query;

  const rows: FilterableRow[] = (requests || []).map((r) => {
    const requester = r.profiles as unknown as { full_name: string } | null;
    const barangay = r.barangays as unknown as { name: string } | null;
    const typeLabel = r.type.replace(/_/g, " ");
    return {
      searchText: `${requester?.full_name || ""} ${typeLabel} ${barangay?.name || ""}`,
      barangay: barangay?.name,
      cells: [
        <span key="requester" className="font-medium">{requester?.full_name || "—"}</span>,
        <span key="type" className="text-muted-foreground capitalize">{typeLabel}</span>,
        <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={r.status} />,
        <RowActions key="actions" id={r.id} kind="certification" status={r.status} />,
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
              { label: "Requester" },
              { label: "Type" },
              { label: "Barangay" },
              { label: "Date" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<FileText />}
            emptyMessage="No certification requests in this category yet."
            searchPlaceholder="Search requester or type..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
