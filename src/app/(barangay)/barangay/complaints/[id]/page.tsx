import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";

export default async function BarangayComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select("*, profiles!complaints_complainant_id_fkey(full_name, email, phone)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
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
          Complaint Case #{id.slice(0, 8)}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">Assign investigators, set schedules, and record mediation findings.</p>
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
            <p className="text-xs text-muted-foreground">Type</p>
            <p className="text-sm font-medium text-foreground capitalize">{complaint.type.replace(/_/g, " ")}</p>
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
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-foreground">{complaint.description}</p>
        </div>

        {complaint.resolution && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Resolution</p>
            <p className="text-sm text-foreground">{complaint.resolution}</p>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <RowActions id={complaint.id} kind="complaint" status={complaint.status} />
        </div>
      </div>
    </div>
  );
}
