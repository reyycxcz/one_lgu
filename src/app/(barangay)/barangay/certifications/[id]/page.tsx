import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";

export default async function BarangayCertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("certification_requests")
    .select("*, profiles!certification_requests_requester_id_fkey(full_name, email, phone), barangays(name)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .single();

  if (!request) notFound();

  const requester = request.profiles as unknown as { full_name: string; email: string; phone: string } | null;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/barangay/certifications" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Requests
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">
          Verification Request #{id.slice(0, 8)}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">Verify attachments, issue certificates, and handle releases.</p>
      </div>

      <div className="bryl-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Certificate Type</p>
            <p className="font-semibold text-foreground capitalize">{request.type.replace(/_/g, " ")}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Requester</p>
            <p className="text-sm font-medium text-foreground">{requester?.full_name || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="text-sm font-medium text-foreground">{requester?.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Phone</p>
            <p className="text-sm font-medium text-foreground">{requester?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Submitted</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(request.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Purpose</p>
          <p className="text-sm text-foreground">{request.purpose}</p>
        </div>

        {request.rejected_reason && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{request.rejected_reason}</p>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <RowActions id={request.id} kind="certification" status={request.status} />
        </div>
      </div>
    </div>
  );
}
