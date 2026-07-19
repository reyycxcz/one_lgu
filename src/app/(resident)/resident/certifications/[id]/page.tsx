import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

export default async function CertificationDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("certification_requests")
    .select("*")
    .eq("id", params.id)
    .eq("requester_id", session.user.id)
    .single();

  if (!cert) {
    return (
      <div className="space-y-8 animate-stagger-in">
        <div>
          <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Certifications
          </Link>
          <h1 className="font-sans text-2xl font-bold text-foreground">Certification Not Found</h1>
          <p className="text-sm text-foreground/55 mt-1">This request does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Certifications
        </Link>
        <h1 className="font-sans text-2xl font-bold text-foreground">Certification Request</h1>
        <p className="text-sm text-foreground/55 mt-1">Request #{cert.id.slice(0, 8)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Document Type</p>
              <h3 className="text-lg font-semibold text-foreground">{cert.type.replace(/_/g, " ")}</h3>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Purpose</p>
              <p className="text-sm text-foreground/75">{cert.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Status</p>
              <span className="inline-block text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {cert.status.replace(/_/g, " ")}
              </span>
            </div>
            {cert.rejected_reason && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600">{cert.rejected_reason}</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <h4 className="font-sans text-sm font-bold text-foreground">Timeline</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Submitted</p>
                  <p className="text-foreground/50">{new Date(cert.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {cert.verified_at && (
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Verified</p>
                    <p className="text-foreground/50">{new Date(cert.verified_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {cert.approved_at && (
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Approved</p>
                    <p className="text-foreground/50">{new Date(cert.approved_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {cert.released_at && (
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-600 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Released</p>
                    <p className="text-foreground/50">{new Date(cert.released_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
