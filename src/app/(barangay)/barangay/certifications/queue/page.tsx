import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { Package } from "lucide-react";
import Link from "next/link";

export default async function CertificateQueuePage() {
  const profile = await requireBarangaySection("certifications");
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("certification_requests")
    .select("id, type, purpose, status, approved_at, profiles!certification_requests_requester_id_fkey(full_name)")
    .eq("barangay_id", profile.barangay_id || "")
    .in("status", ["approved", "generated", "ready_for_pickup"])
    .order("approved_at", { ascending: true });

  const rows: FilterableRow[] = (requests || []).map((r) => {
    const requester = r.profiles as unknown as { full_name: string } | null;
    const typeLabel = r.type.replace(/_/g, " ");
    return {
      searchText: `${requester?.full_name || ""} ${typeLabel}`,
      cells: [
        <Link key="requester" href={`/barangay/certifications/${r.id}`} className="font-medium hover:underline">
          {requester?.full_name || "—"}
        </Link>,
        <span key="type" className="text-muted-foreground capitalize">{typeLabel}</span>,
        <span key="date" className="text-muted-foreground">
          {r.approved_at
            ? new Date(r.approved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>,
        <StatusBadge key="status" status={r.status} />,
        <RowActions key="actions" id={r.id} kind="certification" status={r.status} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Certificate Queue</h1>
        <p className="text-sm text-foreground/60 mt-1">Approved certificates moving through printing and release — mark each as printed, ready for pickup, then released.</p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Requester" },
            { label: "Type" },
            { label: "Approved" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<Package />}
          emptyMessage="Nothing in production right now."
          searchPlaceholder="Search requester or type..."
        />
      </div>
    </div>
  );
}
