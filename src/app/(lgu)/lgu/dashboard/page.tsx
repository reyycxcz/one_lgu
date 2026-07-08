import Link from "next/link";
import { Landmark, FileText, AlertOctagon, ShieldAlert, ChevronRight, Database } from "lucide-react";

export default function LGUDashboard() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <span className="micro-label">01 — CONSOLIDATED ANALYTICS</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">LGU Console Dashboard</h1>
        <p className="text-sm text-foreground/60 mt-1">Consolidated Oversight — Laoag City, Ilocos Norte.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">TOTAL BARANGAYS</span>
            <Landmark className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">5 ACTIVE</div>
            <p className="text-[10px] text-foreground/50 mt-1">Registered in system</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">PENDING REVIEWS</span>
            <FileText className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">3 REPORTS</div>
            <p className="text-[10px] text-foreground/50 mt-1">Awaiting LGU evaluation</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">ACTIVE COMPLAINTS</span>
            <AlertOctagon className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">8 UNRESOLVED</div>
            <p className="text-[10px] text-foreground/50 mt-1">Across all jurisdictions</p>
          </div>
        </div>

        <div className="bryl-card p-6 flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="micro-label">COMPLIANCE STATE</span>
            <ShieldAlert className="h-4 w-4 text-foreground/40" />
          </div>
          <div>
            <div className="font-pixel text-3xl">80% COMPLIANT</div>
            <p className="text-[10px] text-foreground/50 mt-1">4 of 5 barangays compliant</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Barangay compliance list */}
        <div className="bryl-card p-6 space-y-6 lg:col-span-2">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">JURISDICTION MONITOR</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Barangay Compliance Status</h3>
            </div>
            <Link href="/lgu/barangays" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
              <div>
                <p className="text-sm font-semibold">Barangay San Jose</p>
                <p className="text-xs text-foreground/50">Code: BGY-001 • Updated 2 hrs ago</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="green-chip text-[9px]">COMPLIANT</span>
                <Link href="/lgu/barangays/1" className="p-1 hover:text-primary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
              <div>
                <p className="text-sm font-semibold">Barangay Santa Rita</p>
                <p className="text-xs text-foreground/50">Code: BGY-002 • Report Overdue by 3 days</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-[9px] bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold uppercase">
                  NON-COMPLIANT
                </span>
                <Link href="/lgu/barangays/2" className="p-1 hover:text-primary transition-colors">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* L7 Audit Trail */}
        <div className="bryl-card p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">AUDIT TRAILS</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Recent Activity</h3>
            </div>
            <Link href="/lgu/audit-logs" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              Logs <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 text-xs border-b border-border/40 pb-3">
              <Database className="h-4 w-4 text-foreground/40 shrink-0" />
              <div>
                <p className="font-semibold text-foreground/95">certification.approved</p>
                <p className="text-[10px] text-foreground/50">Actor: Barangay Captain (BGY-001)</p>
                <p className="text-[9px] font-mono text-foreground/40">Jul 8, 2026 8:44 PM</p>
              </div>
            </div>

            <div className="flex gap-3 text-xs border-b border-border/40 pb-3">
              <Database className="h-4 w-4 text-foreground/40 shrink-0" />
              <div>
                <p className="font-semibold text-foreground/95">report.submitted</p>
                <p className="text-[10px] text-foreground/50">Actor: SK Chairman (BGY-003)</p>
                <p className="text-[9px] font-mono text-foreground/40">Jul 8, 2026 7:12 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
