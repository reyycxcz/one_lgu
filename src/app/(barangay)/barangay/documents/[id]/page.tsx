import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl } from "@/lib/storage/file-url";
import { DEPARTMENT_LABELS } from "@/lib/auth/departments";
import { documentRequestTypeLabel, recurrenceLabel } from "@/lib/documents/request-types";
import { Button } from "@/components/ui/button";

export default async function DocumentRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("documents");
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("document_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!request) notFound();

  // Verify this barangay is actually a recipient of the request before
  // showing anything about it or its submission.
  const { data: recipient } = await supabase
    .from("request_recipients")
    .select("id")
    .eq("request_id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .maybeSingle();

  if (!recipient) notFound();

  const { data: submission } = await supabase
    .from("document_submissions")
    .select("*, submission_reviews(review_notes, status, created_at)")
    .eq("request_id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .maybeSingle();

  const reviews = (submission?.submission_reviews as any[]) || [];
  const latestReview = [...reviews].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

  const departmentLabel = request.requesting_department_id
    ? (DEPARTMENT_LABELS[request.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || request.requesting_department_id)
    : "LGU Department";

  const viewUrl = submission ? getFileViewUrl(submission.file_url, submission.file_name) : "#";
  const canSubmit = !submission || ["returned", "resubmission_required"].includes(submission.status);

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/barangay/documents" className="inline-flex items-center gap-1.5 font-sans text-xs text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to LGU Documents
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-sans font-bold text-2xl tracking-tight">{request.title}</h1>
          {submission ? (
            <StatusBadge status={submission.status} />
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 border border-red-100 text-[11px] font-sans font-bold rounded-full">
              Not Submitted
            </span>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/60 pb-4 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <span className="micro-label">Requested By</span>
              <p className="text-sm font-semibold text-foreground/80 mt-1">{departmentLabel}</p>
            </div>
            <div>
              <span className="micro-label">Document Type</span>
              <p className="text-sm font-semibold text-foreground/80 mt-1">{documentRequestTypeLabel(request.document_type)}</p>
            </div>
            {request.recurrence && request.recurrence !== "one_time" && (
              <div>
                <span className="micro-label">Recurrence</span>
                <p className="text-sm font-semibold text-foreground/80 mt-1">{recurrenceLabel(request.recurrence)} — expect a new request each cycle</p>
              </div>
            )}
          </div>

          {request.description && (
            <div className="border-b border-border/60 pb-4">
              <span className="micro-label">Description</span>
              <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{request.description}</p>
            </div>
          )}

          <div className="border-b border-border/60 pb-4">
            <span className="micro-label">Deadline</span>
            <p className="text-sm font-semibold text-foreground/80 mt-1">
              {new Date(request.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {submission ? (
            <div>
              <span className="micro-label">Submitted File</span>
              <div className="mt-2 p-3.5 rounded-lg border border-border bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground">{submission.file_name || "Document"}</span>
                </div>
                {submission.file_url && (
                  <a
                    href={viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-bold shrink-0 transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> View File
                  </a>
                )}
              </div>
              {submission.remarks && (
                <p className="text-xs text-foreground/60 mt-2 italic">"{submission.remarks}"</p>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-border bg-slate-50/50 text-center text-xs text-foreground/60">
              Nothing has been submitted for this request yet.
            </div>
          )}

          {submission?.status === "returned" && submission.captain_notes && (
            <div className="border-t border-border/60 pt-4">
              <span className="micro-label">Your Captain's Notes</span>
              <p className="text-sm text-foreground/80 mt-1">{submission.captain_notes}</p>
            </div>
          )}

          {(submission?.status === "returned" || submission?.status === "resubmission_required") && latestReview?.review_notes && (
            <div className="border-t border-border/60 pt-4">
              <span className="micro-label">LGU Review Notes</span>
              <p className="text-sm text-foreground/80 mt-1">{latestReview.review_notes}</p>
            </div>
          )}

          {canSubmit && (
            <div className="border-t border-border/60 pt-4">
              <Button asChild className="text-xs font-bold">
                <Link href={`/barangay/reports/new-response?requestId=${request.id}`} className="flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5" /> {submission ? "Submit Corrected Document" : "Submit Document"}
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div>
          {submission ? (
            <StatusTimeline
              currentStatus={submission.status}
              kind="report"
              metadata={{
                createdAt: submission.created_at,
                reviewedAt: latestReview?.created_at,
                reviewNotes: latestReview?.review_notes,
                captainNotes: submission.captain_notes,
              }}
            />
          ) : (
            <div className="bg-white border border-border/80 rounded-2xl p-5 md:p-6 shadow-2xs text-center">
              <UploadCloud className="h-6 w-6 text-foreground/30 mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">Awaiting Your Submission</p>
              <p className="text-[11px] text-muted-foreground mt-1">The status timeline will appear here once a document is submitted.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
