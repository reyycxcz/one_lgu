import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { complaintTypeLabel } from "@/lib/complaints/taxonomy";

export default async function BarangayComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("complaints");
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select("*, profiles!complaints_complainant_id_fkey(full_name, email, phone)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "formal_complaint")
    .single();

  if (!complaint) notFound();

  const complainant = complaint.profiles as unknown as { full_name: string; email: string; phone: string } | null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/barangay/complaints" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Complaints
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">
          BC-{id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">Formal complaint / dispute — review notices, mediation, and settlement.</p>
      </div>

      <div className="bryl-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="font-semibold text-foreground">{complaint.subject}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Complainant</p>
            <p className="text-sm font-medium text-foreground">{complainant?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-medium text-foreground capitalize">{complaintTypeLabel(complaint.type)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Respondent</p>
            <p className="text-sm font-medium text-foreground">{complaint.respondent_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Filed</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(complaint.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Complaint Details</p>
          <p className="text-sm text-foreground">{complaint.description}</p>
        </div>

        {complaint.notice_details && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Notice / Summons</p>
            <p className="text-sm text-foreground">{complaint.notice_details}</p>
            {complaint.notice_issued_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Issued {new Date(complaint.notice_issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        )}

        {complaint.scheduled_date && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Mediation Hearing Date</p>
            <p className="text-sm text-foreground">
              {new Date(complaint.scheduled_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        )}

        {complaint.mediation_notes && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Mediation Notes</p>
            <p className="text-sm text-foreground">{complaint.mediation_notes}</p>
          </div>
        )}

        {(complaint.pangkat_members || complaint.pangkat_notes) && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Pangkat Conciliation</p>
            {complaint.pangkat_members && <p className="text-sm text-foreground">Members: {complaint.pangkat_members}</p>}
            {complaint.pangkat_notes && <p className="text-sm text-foreground mt-1">{complaint.pangkat_notes}</p>}
          </div>
        )}

        {complaint.resolution && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Settlement / Resolution</p>
            <p className="text-sm text-foreground">{complaint.resolution}</p>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <RowActions id={complaint.id} kind="complaint" status={complaint.status} recordType={complaint.record_type} />
        </div>
      </div>
    </div>
  );
}
