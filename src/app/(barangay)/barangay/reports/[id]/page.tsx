import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!report) {
    return (
      <div className="space-y-8 animate-stagger-in">
        <div>
          <Link href="/barangay/reports" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
          </Link>
          <h1 className="font-sans text-2xl font-bold text-foreground">Report Not Found</h1>
          <p className="text-sm text-foreground/55 mt-1">This report does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/barangay/reports" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Reports
        </Link>
        <h1 className="font-sans text-2xl font-bold text-foreground">Report Details</h1>
        <p className="text-sm text-foreground/55 mt-1">Report #{report.id.slice(0, 8)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Title</p>
              <h3 className="text-lg font-semibold text-foreground">{report.title}</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Type</p>
                <p className="text-sm text-foreground/75 uppercase">{report.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Status</p>
                <span className="inline-block text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {report.status.replace(/_/g, " ")}
                </span>
              </div>
            </div>
            {report.period_start && report.period_end && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Period</p>
                <p className="text-sm text-foreground/75">{report.period_start} to {report.period_end}</p>
              </div>
            )}
            {report.file_name && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">File</p>
                <div className="flex items-center gap-2 text-sm text-foreground/75">
                  <FileText className="h-4 w-4" /> {report.file_name}
                </div>
              </div>
            )}
            {report.review_notes && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Review Notes</p>
                <p className="text-sm text-foreground/75 italic">{report.review_notes}</p>
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
                  <p className="text-foreground/50">{new Date(report.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {report.reviewed_at && (
                <div className="flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Reviewed</p>
                    <p className="text-foreground/50">{new Date(report.reviewed_at).toLocaleDateString()}</p>
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
