import Link from "next/link";
import { Plus, ClipboardList, Calendar, ChevronRight, FileText } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

const MOCK_REPORTS = [
  {
    id: "REP-4011",
    title: "Q2 Accomplishment Report",
    type: "accomplishment",
    period: "Apr 1, 2026 - Jun 30, 2026",
    status: "approved",
    file: "Accomplishment_Report_Q2_BGY-001.pdf",
    reviewedBy: "Engr. Clara Mendez (LGU Admin)",
  },
  {
    id: "REP-3908",
    title: "June Financial Expense Ledger",
    type: "financial",
    period: "Jun 1, 2026 - Jun 30, 2026",
    status: "submitted",
    file: "Financial_Report_June_BGY-001.xlsx",
    reviewedBy: null,
  },
];

const REPORT_TYPE_COLORS: Record<string, string> = {
  accomplishment: "bg-[#C7FFCF] text-[#2D2A32]",
  financial: "bg-blue-100 text-blue-800",
  monthly: "bg-purple-100 text-purple-800",
  compliance: "bg-orange-100 text-orange-800",
};

export default function BarangayReportsPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="micro-label">02 — OFFICIAL REPORTING</span>
          <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Accomplishment Reports</h1>
          <p className="text-sm text-foreground/60 mt-1">Submit reports and track review decisions from the municipal office.</p>
        </div>
        <Link href="/barangay/reports/new" className="green-chip text-xs py-2.5 px-4 inline-flex items-center gap-1.5 self-start">
          <Plus className="h-4 w-4" /> Submit New Report
        </Link>
      </div>

      {/* Reports Table List */}
      <div className="space-y-4">
        {MOCK_REPORTS.map((report) => (
          <div key={report.id} className="bryl-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-foreground/75" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${REPORT_TYPE_COLORS[report.type]}`}>
                    {report.type}
                  </span>
                  <span className="font-mono text-[10px] text-foreground/45 font-semibold">{report.id}</span>
                </div>
                <h3 className="font-sans font-semibold text-base text-foreground">{report.title}</h3>
                <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Period: {report.period}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-foreground/40 font-mono pt-1">
                  <FileText className="h-3 w-3" /> {report.file}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
              <div className="text-right hidden md:block">
                <StatusBadge status={report.status} />
                {report.reviewedBy && (
                  <p className="text-[9px] text-foreground/40 font-mono mt-1">Reviewer: {report.reviewedBy}</p>
                )}
              </div>
              <div className="md:hidden">
                <StatusBadge status={report.status} />
              </div>
              <Link
                href={`/barangay/reports/${report.id}`}
                className="p-1 hover:text-primary transition-colors shrink-0"
              >
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
