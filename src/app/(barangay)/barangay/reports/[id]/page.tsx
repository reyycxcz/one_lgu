import Link from "next/link";
import { ArrowLeft, Calendar, FileText, Download, MessageCircle } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const reportDetails = {
    id: params.id,
    title: "Q2 Accomplishment Report",
    type: "accomplishment",
    period: "Apr 1, 2026 - Jun 30, 2026",
    status: "approved",
    fileName: "Accomplishment_Report_Q2_BGY-001.pdf",
    submittedAt: "Jul 1, 2026, 04:30 PM",
    submittedBy: "Santiago O. (Barangay Captain)",
    reviewedBy: "Engr. Clara Mendez (LGU Admin)",
    reviewedAt: "Jul 3, 2026, 09:15 AM",
    reviewNotes: "The accomplishment report satisfies all LGU monitoring parameters. Expenditure mappings match targets.",
  };

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/barangay/reports" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <span className="micro-label">02 — OFFICIAL REVIEW</span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-pixel text-4xl uppercase tracking-wider">Report Metadata</h1>
          <span className="font-mono text-sm text-foreground/40">#{reportDetails.id}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/80 pb-4">
            <span className="micro-label font-bold">REPORT TITLE</span>
            <h3 className="text-xl font-semibold mt-1">{reportDetails.title}</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="micro-label">REPORT TYPE</span>
              <p className="text-sm font-semibold uppercase text-foreground/80 mt-1">{reportDetails.type}</p>
            </div>
            <div>
              <span className="micro-label">REVIEW DECISION</span>
              <div className="mt-1">
                <StatusBadge status={reportDetails.status} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="micro-label">COVERED PERIOD</span>
              <p className="text-sm text-foreground/80 mt-1 inline-flex items-center gap-1.5 font-medium">
                <Calendar className="h-4 w-4" /> {reportDetails.period}
              </p>
            </div>
            <div>
              <span className="micro-label">DATE DISPATCHED</span>
              <p className="text-sm text-foreground/80 mt-1">{reportDetails.submittedAt}</p>
            </div>
          </div>

          <div>
            <span className="micro-label">SUBMITTED FILE</span>
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl mt-1">
              <div className="flex items-center gap-2">
                <FileText className="h-4.5 w-4.5 text-foreground/60" />
                <span className="text-sm font-semibold">{reportDetails.fileName}</span>
              </div>
              <button className="green-chip text-[9px] py-1 inline-flex items-center gap-1">
                <Download className="h-3 w-3" /> Download
              </button>
            </div>
          </div>
        </div>

        {/* LGU Review Feedback sidebar */}
        <div className="space-y-6">
          {reportDetails.status === "approved" || reportDetails.status === "rejected" ? (
            <div className="bryl-card bg-primary/10 border-primary p-6 space-y-4">
              <h4 className="font-pixel text-lg uppercase tracking-wider flex items-center gap-2">
                <MessageCircle className="h-4.5 w-4.5" /> LGU Feedback
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="font-bold">Reviewed By</p>
                  <p className="text-foreground/75">{reportDetails.reviewedBy}</p>
                </div>
                <div>
                  <p className="font-bold">Evaluation Date</p>
                  <p className="text-foreground/75">{reportDetails.reviewedAt}</p>
                </div>
                <div>
                  <p className="font-bold">Review Notes</p>
                  <p className="text-foreground/75 italic leading-relaxed">&ldquo;{reportDetails.reviewNotes}&rdquo;</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bryl-card-faint p-6 space-y-2 text-center text-xs">
              <p className="font-bold text-foreground/70">Awaiting Evaluation</p>
              <p className="text-foreground/50">This report has been successfully dispatched to LGU reviewers and is currently pending audit.</p>
            </div>
          )}

          <div className="bryl-card-faint p-6 space-y-4">
            <h4 className="font-pixel text-lg uppercase tracking-wider">SUBMISSION HISTORY</h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="relative pl-6 border-l border-border/80">
                <span className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-bold text-foreground">Report Submitted</p>
                <p className="text-[10px] text-foreground/50">By {reportDetails.submittedBy}</p>
                <p className="text-[9px] text-foreground/45">{reportDetails.submittedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
