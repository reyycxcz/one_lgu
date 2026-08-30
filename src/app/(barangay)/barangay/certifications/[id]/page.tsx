import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Paperclip, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl } from "@/lib/storage/file-url";

interface RequirementAttachment {
  name?: string;
  file_url?: string;
  url?: string;
  uploaded_at?: string;
}

export default async function BarangayCertificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("certifications");
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("certification_requests")
    .select("*, profiles!certification_requests_requester_id_fkey(full_name, email, phone), barangays(name)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .single();

  if (!request) notFound();

  const requester = request.profiles as unknown as { full_name: string; email: string; phone: string } | null;
  const requirements = (request.requirements as unknown as RequirementAttachment[]) || [];

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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                <p className="text-sm text-red-700 font-medium">{request.rejected_reason}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <RowActions id={request.id} kind="certification" status={request.status} />
            </div>
          </div>

          {/* Submitted Requirements / Attachments */}
          {requirements.length > 0 && (
            <div className="bryl-card p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h4 className="font-sans text-sm font-bold text-foreground">Submitted Requirement Files</h4>
              </div>
              <p className="text-xs text-muted-foreground">Check and evaluate the resident&apos;s submitted proof documents.</p>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {requirements.map((req, i) => {
                  const fileUrl = req.file_url || req.url || "";
                  const fileName = req.name || `Requirement_${i + 1}.pdf`;
                  const viewUrl = getFileViewUrl(fileUrl, fileName);

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border bg-slate-50 flex items-center justify-between gap-3 text-xs shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="truncate font-medium text-foreground">{fileName}</span>
                      </div>
                      {fileUrl && (
                        <a
                          href={viewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-bold shrink-0 transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" /> View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div>
          <StatusTimeline
            currentStatus={request.status}
            kind="certification"
            metadata={{
              createdAt: request.created_at,
              verifiedAt: request.verified_at,
              approvedAt: request.approved_at,
              releasedAt: request.released_at,
              rejectedReason: request.rejected_reason,
            }}
          />
        </div>
      </div>
    </div>
  );
}
