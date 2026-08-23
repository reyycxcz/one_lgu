import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { complaintTypeLabel, PRIORITY_LABELS } from "@/lib/complaints/taxonomy";
import { Wrench } from "lucide-react";
import Link from "next/link";

export default async function ServiceReportsPage() {
  const profile = await requireBarangaySection("service_reports");
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("complaints")
    .select("id, subject, type, status, record_type, priority, created_at, assigned_to_label, profiles!complaints_complainant_id_fkey(full_name)")
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "service_report")
    .order("created_at", { ascending: false });

  const rows: FilterableRow[] = (reports || []).map((r) => {
    const reporter = r.profiles as unknown as { full_name: string } | null;
    return {
      searchText: `${r.subject} ${reporter?.full_name || ""} ${complaintTypeLabel(r.type)}`,
      cells: [
        <Link key="subject" href={`/barangay/service-reports/${r.id}`} className="font-medium hover:underline">
          {r.subject}
        </Link>,
        <span key="category" className="text-muted-foreground capitalize">{complaintTypeLabel(r.type)}</span>,
        <span key="reporter" className="text-muted-foreground">{reporter?.full_name || "—"}</span>,
        <span key="assigned" className="text-muted-foreground">{r.assigned_to_label || "—"}</span>,
        <span key="priority" className="text-muted-foreground capitalize">{PRIORITY_LABELS[r.priority] || r.priority}</span>,
        <StatusBadge key="status" status={r.status} />,
        <RowActions key="actions" id={r.id} kind="complaint" status={r.status} recordType={r.record_type} viewHref={`/barangay/service-reports/${r.id}`} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Community Reports</h1>
        <p className="text-sm text-foreground/60 mt-1">Barangay service and facility concerns — receive, classify, assign, and track to resolution. Not formal disputes.</p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Subject" },
            { label: "Category" },
            { label: "Reporter" },
            { label: "Assigned To" },
            { label: "Priority" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<Wrench />}
          emptyMessage="No community reports yet."
          searchPlaceholder="Search subject, reporter, or category..."
        />
      </div>
    </div>
  );
}
