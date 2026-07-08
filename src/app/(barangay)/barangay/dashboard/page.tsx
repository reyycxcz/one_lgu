import Link from "next/link";
import { FileText, AlertOctagon, ClipboardList, CheckCircle2, ChevronRight } from "lucide-react";

export default function BarangayDashboard() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <span className="micro-label">01 — OFFICIAL OVERVIEW</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Barangay Admin Dashboard</h1>
        <p className="text-sm text-foreground/60 mt-1">Barangay San Jose, Laoag City — Operations Center.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">PENDING CERTS</span>
            <FileText className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">4 REQUESTS</div>
            <p className="text-[10px] text-foreground/50 mt-1">Needs verification/approval</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">ACTIVE COMPLAINTS</span>
            <AlertOctagon className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">2 CASES</div>
            <p className="text-[10px] text-foreground/50 mt-1">Scheduled for mediation</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">REPORTS STATUS</span>
            <ClipboardList className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">SUBMITTED</div>
            <p className="text-[10px] text-foreground/50 mt-1">June Accomplishment Report</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">COMPLIANCE SCORE</span>
            <CheckCircle2 className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">92% TARGET</div>
            <p className="text-[10px] text-foreground/50 mt-1">Excellent standing with LGU</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Certificate Requests Queue */}
        <div className="bryl-card p-6 space-y-6 lg:col-span-2">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">INCOMING QUEUE</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Certification Requests</h3>
            </div>
            <Link href="/barangay/certifications" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              View Queue <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-muted/20 border border-border/60 rounded-xl hover:border-primary transition-all gap-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-foreground bg-primary px-2 py-0.5 rounded uppercase">
                  CLEARANCE
                </span>
                <p className="text-sm font-semibold mt-1">Juan Dela Cruz</p>
                <p className="text-xs text-foreground/60">Purpose: Employment Requirement</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-foreground/50">Requested 2 hrs ago</span>
                <Link href="/barangay/certifications/123" className="green-chip text-[9px] py-1">
                  Process
                </Link>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-muted/20 border border-border/60 rounded-xl hover:border-primary transition-all gap-3">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded uppercase">
                  BUSINESS
                </span>
                <p className="text-sm font-semibold mt-1">Sari-Sari Store Permit</p>
                <p className="text-xs text-foreground/60">Applicant: Maria Santos</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[10px] text-foreground/50">Requested 5 hrs ago</span>
                <Link href="/barangay/certifications/456" className="green-chip text-[9px] py-1">
                  Process
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Complaints Case Queue */}
        <div className="bryl-card p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">INCIDENTS</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Mediation Cases</h3>
            </div>
            <Link href="/barangay/complaints" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              View Cases <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="p-3 bg-muted/20 border border-border/60 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <span className="font-mono text-[9px] font-bold text-foreground bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">
                  SCHEDULED
                </span>
                <span className="font-mono text-[9px] text-foreground/50">Jul 12, 10:00 AM</span>
              </div>
              <p className="text-sm font-semibold">Boundary Dispute</p>
              <p className="text-xs text-foreground/60">Complainant: Pedro Penduko vs. Neighbor</p>
              <Link href="/barangay/complaints/789" className="block text-center font-mono text-[10px] uppercase font-bold text-foreground hover:underline border-t border-border/40 pt-2 mt-2">
                Manage Schedule
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
