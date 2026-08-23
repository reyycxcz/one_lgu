import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { CalendarClock } from "lucide-react";
import Link from "next/link";

export default async function MediationDocketPage() {
  const profile = await requireBarangaySection("complaints");
  const supabase = await createClient();

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id, subject, type, status, record_type, scheduled_date, profiles!complaints_complainant_id_fkey(full_name)")
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "formal_complaint")
    .in("status", ["scheduled", "mediation"])
    .order("scheduled_date", { ascending: true, nullsFirst: false });

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
          {c.scheduled_date
            ? new Date(c.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "—"}
        </span>,
        <StatusBadge key="status" status={c.status} />,
        <RowActions key="actions" id={c.id} kind="complaint" status={c.status} recordType={c.record_type} viewHref={`/barangay/complaints/${c.id}`} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Mediation Docket</h1>
        <p className="text-sm text-foreground/60 mt-1">Cases scheduled for or currently in mediation, sorted by hearing date.</p>
      </div>
      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Subject" },
            { label: "Complainant" },
            { label: "Hearing Date" },
            { label: "Status", align: "right" },
            { label: "Actions", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<CalendarClock />}
          emptyMessage="No mediation hearings scheduled right now."
          searchPlaceholder="Search subject or complainant..."
        />
      </div>
    </div>
  );
}
