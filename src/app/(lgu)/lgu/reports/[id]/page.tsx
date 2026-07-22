import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";

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
          <p className="text-xs text-muted-foreground mb-1">Submitted File</p>
          <a
            href={report.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-primary rounded-lg text-sm font-semibold hover:bg-secondary/70 transition-colors"
          >
            <Download className="h-4 w-4" /> {report.file_name || "Download File"}
          </a>
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
  );
}
