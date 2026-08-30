import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl } from "@/lib/storage/file-url";

export default async function LguReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*, profiles!reports_submitted_by_fkey(full_name, email), barangays(name)")
    .eq("id", id)
    .single();

  if (!report) notFound();

  const submitter = report.profiles as unknown as { full_name: string; email: string } | null;
  const barangay = report.barangays as unknown as { name: string } | null;
  const viewUrl = getFileViewUrl(report.file_url, report.file_name);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/lgu/reports/pending" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">{report.title}</h1>
          <StatusBadge status={report.status} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">Evaluate the document file and submit an approval status decision.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bryl-card p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Type</p>
                <p className="text-sm font-medium text-foreground capitalize">{report.type}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Barangay</p>
                <p className="text-sm font-medium text-foreground">{barangay?.name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted By</p>
                <p className="text-sm font-medium text-foreground">{submitter?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submitted On</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
              {report.period_start && report.period_end && (
                <div className="sm:col-span-2">
                  <p className="text-xs text-muted-foreground">Period Covered</p>
                  <p className="text-sm font-medium text-foreground">
                    {new Date(report.period_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" — "}
                    {new Date(report.period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Submitted File</p>
              <div className="p-3.5 rounded-lg border border-border bg-slate-50 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="truncate font-medium text-foreground">{report.file_name || "Document"}</span>
                </div>
                {report.file_url && (
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
            </div>

            {report.review_notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Review Notes</p>
                <p className="text-sm text-foreground">{report.review_notes}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <RowActions id={report.id} kind="report" status={report.status} />
            </div>
          </div>
        </div>

        <div>
          <StatusTimeline
            currentStatus={report.status}
            kind="report"
            metadata={{
              createdAt: report.created_at,
              reviewedAt: report.reviewed_at,
              reviewNotes: report.review_notes,
            }}
          />
        </div>
      </div>
    </div>
  );
}
