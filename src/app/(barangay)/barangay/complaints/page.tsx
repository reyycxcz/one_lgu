import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function BarangayComplaintsPage() {
  const profile = await requireBarangaySection("complaints");
  const supabase = await createClient();

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id, subject, type, status, record_type, created_at, profiles!complaints_complainant_id_fkey(full_name)")
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "formal_complaint")
    .order("created_at", { ascending: false });

  const rows: FilterableRow[] = (complaints || []).map((c) => {
    const complainant = c.profiles as unknown as { full_name: string } | null;
    return {
      searchText: `${c.subject} ${complainant?.full_name || ""}`,
      cells: [
        <Link key="subject" href={`/barangay/complaints/${c.id}`} className="font-medium hover:underline">
          {c.subject}
        </Link>,
        <span key="complainant" className="text-muted-foreground">{complainant?.full_name || "—"}</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={c.status} />,
        <RowActions key="actions" id={c.id} kind="complaint" status={c.status} recordType={c.record_type} viewHref={`/barangay/complaints/${c.id}`} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Complaint Cases</h1>
        <p className="text-sm text-foreground/60 mt-1">Formal disputes between parties — notices, mediation, and Pangkat conciliation when applicable. Community concerns are tracked separately under Community Reports.</p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Subject" },
            { label: "Complainant" },
            { label: "Date" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<AlertTriangle />}
          emptyMessage="No formal complaints filed yet."
          searchPlaceholder="Search subject or complainant..."
        />
      </div>
    </div>
  );
}
