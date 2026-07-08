import Link from "next/link";
import { Plus, Search, AlertOctagon, Calendar, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock complaints data
const MOCK_COMPLAINTS = [
  {
    id: "CASE-4402",
    subject: "Noise Complaint (Late Night Karaoke)",
    respondent: "Residential Property Block B",
    dateFiled: "Jul 1, 2026",
    status: "mediation",
  },
  {
    id: "CASE-3911",
    subject: "Boundary Fence Dispute",
    respondent: "F. Perez (Neighbor)",
    dateFiled: "May 10, 2026",
    status: "resolved",
  },
];

export default function ResidentComplaintsPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="micro-label">03 — COMPLAINT REGISTRY</span>
          <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">My Filed Complaints</h1>
          <p className="text-sm text-foreground/60 mt-1">Submit local grievances and track scheduling for barangay mediation.</p>
        </div>
        <Link href="/resident/complaints/new" className="green-chip text-xs py-2.5 px-4 inline-flex items-center gap-1.5 self-start">
          <Plus className="h-4 w-4" /> File New Complaint
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search incident subject or case number..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <select className="px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
          <option value="all">All Cases</option>
          <option value="active">Active Mediation</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {MOCK_COMPLAINTS.map((complaint) => (
          <div key={complaint.id} className="bryl-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#E7FFEA] border border-border flex items-center justify-center shrink-0">
                <AlertOctagon className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-foreground/40 font-semibold">{complaint.id}</span>
                </div>
                <h3 className="font-sans font-semibold text-base text-foreground">{complaint.subject}</h3>
                <p className="text-xs text-foreground/60">Respondent: {complaint.respondent}</p>
                <div className="flex items-center gap-1 text-[11px] text-foreground/40 font-mono">
                  <Calendar className="h-3 w-3" /> Filed on {complaint.dateFiled}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
              <StatusBadge status={complaint.status} />
              <Link
                href={`/resident/complaints/${complaint.id}`}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:underline"
              >
                View Case Logs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
