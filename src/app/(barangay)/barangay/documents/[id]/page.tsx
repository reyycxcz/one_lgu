import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/status-badge";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .single();

  if (!report) notFound();

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/barangay/documents" className="inline-flex items-center gap-1.5 font-sans text-xs text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Checklist
        </Link>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-sans font-bold text-2xl tracking-tight">{report.title}</h1>
          <StatusBadge status={report.status} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <span className="micro-label">Type</span>
            <p className="text-sm font-semibold text-foreground/80 mt-1 capitalize">{report.type}</p>
          </div>

          {report.period_start && report.period_end && (
            <div className="border-b border-border/60 pb-4">
              <span className="micro-label">Period Covered</span>
              <p className="text-sm font-semibold text-foreground/80 mt-1">
                {new Date(report.period_start).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                {" — "}
                {new Date(report.period_end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}

          <div>
            <span className="micro-label">Submitted File</span>
            <a
              href={report.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-primary rounded-lg text-sm font-semibold hover:bg-secondary/70 transition-colors"
            >
              <Download className="h-4 w-4" /> {report.file_name || "Download File"}
            </a>
          </div>

          {report.review_notes && (
            <div className="border-t border-border/60 pt-4">
              <span className="micro-label">Review Notes</span>
              <p className="text-sm text-foreground/80 mt-1">{report.review_notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4 text-xs font-sans leading-relaxed text-foreground/80">
            <h4 className="font-sans text-sm font-semibold text-foreground">Submission Details</h4>
            <p>
              Submitted on {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            </p>
            {report.reviewed_at && (
              <p>
                Reviewed on {new Date(report.reviewed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
