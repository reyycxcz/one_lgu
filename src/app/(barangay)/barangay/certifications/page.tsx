import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { FileText } from "lucide-react";
import Link from "next/link";

export default async function BarangayCertificationsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("certification_requests")
    .select("id, type, purpose, status, created_at, profiles!certification_requests_requester_id_fkey(full_name)")
    .eq("barangay_id", profile.barangay_id || "")
    .order("created_at", { ascending: false });

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
          {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={r.status} />,
        <RowActions key="actions" id={r.id} kind="certification" status={r.status} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Certification Requests</h1>
        <p className="text-sm text-foreground/60 mt-1">Review, approve, and release resident certification documents.</p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Requester" },
            { label: "Type" },
            { label: "Date" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<FileText />}
          emptyMessage="No certification requests yet."
          searchPlaceholder="Search requester or type..."
        />
      </div>
    </div>
  );
}
