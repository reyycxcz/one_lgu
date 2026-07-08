import Link from "next/link";
import { FileText, AlertOctagon, Plus, Calendar, Clock, ChevronRight, CheckCircle2 } from "lucide-react";

export default function ResidentDashboard() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="micro-label">01 — OVERVIEW</span>
          <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Resident Dashboard</h1>
          <p className="text-sm text-foreground/60 mt-1">Welcome back, Juan! Barangay San Jose, Laoag City.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link href="/resident/certifications/new" className="green-chip text-xs py-2 px-4 inline-flex items-center gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Request Certificate
          </Link>
          <Link href="/resident/complaints/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-muted/40 hover:bg-muted/80 border border-border rounded-full font-mono text-xs uppercase tracking-wider transition-all">
            <Plus className="h-3.5 w-3.5" /> File Complaint
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bryl-card p-6 flex items-center justify-between">
          <div>
            <span className="micro-label">ACTIVE CERTIFICATES</span>
            <div className="font-pixel text-3xl mt-1">1 PENDING</div>
            <p className="text-xs text-foreground/50 mt-1">Barangay Clearance request</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <FileText className="h-5 w-5" />
          </div>
        </div>

        <div className="bryl-card p-6 flex items-center justify-between">
          <div>
            <span className="micro-label">FILED COMPLAINTS</span>
            <div className="font-pixel text-3xl mt-1">0 ACTIVE</div>
            <p className="text-xs text-foreground/50 mt-1">All cases are resolved or closed</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <AlertOctagon className="h-5 w-5" />
          </div>
        </div>

        <div className="bryl-card p-6 flex items-center justify-between sm:col-span-2 lg:col-span-1">
          <div>
            <span className="micro-label">BARANGAY STATUS</span>
            <div className="font-pixel text-3xl mt-1">OPERATIONAL</div>
            <p className="text-xs text-foreground/50 mt-1">Barangay Hall open: 8AM - 5PM</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Certificate Requests List */}
        <div className="bryl-card p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">TRACKING</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Certifications</h3>
            </div>
            <Link href="/resident/certifications" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/60 rounded-xl hover:border-primary transition-all">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-foreground bg-primary px-2 py-0.5 rounded uppercase">
                  CLEARANCE
                </span>
                <p className="text-sm font-semibold mt-1">Barangay Clearance</p>
                <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Requested Jul 8, 2026</span>
                </div>
              </div>
              <span className="green-chip text-[9px]">Verified</span>
            </div>

            <div className="flex justify-between items-center p-3 bg-muted/20 border border-border/60 rounded-xl">
              <div className="space-y-1">
                <span className="font-mono text-[10px] font-bold text-foreground bg-secondary px-2 py-0.5 rounded uppercase">
                  INDIGENCY
                </span>
                <p className="text-sm font-semibold mt-1">Certificate of Indigency</p>
                <div className="flex items-center gap-1.5 text-xs text-foreground/50">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  <span>Released Jun 15, 2026</span>
                </div>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider text-foreground/60">Released</span>
            </div>
          </div>
        </div>

        {/* Complaints Tracking List */}
        <div className="bryl-card p-6 space-y-6">
          <div className="flex justify-between items-end border-b border-border/80 pb-4">
            <div>
              <span className="micro-label">TRACKING</span>
              <h3 className="font-pixel text-xl uppercase mt-1">Active Complaints</h3>
            </div>
            <Link href="/resident/complaints" className="font-mono text-[10px] uppercase text-foreground/60 hover:text-foreground flex items-center">
              View All <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-50 border border-border flex items-center justify-center">
              <AlertOctagon className="h-6 w-6 text-foreground/30" />
            </div>
            <p className="text-sm font-medium text-foreground/70">No Active Complaints</p>
            <p className="text-xs text-foreground/50 max-w-xs">You have not filed any complaints, or all your cases have been resolved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
