import Link from "next/link";
import { Plus, Search, FileText, Calendar, ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";

// Mock certifications data
const MOCK_CERTS = [
  {
    id: "CERT-9081",
    type: "barangay_clearance",
    label: "Barangay Clearance",
    purpose: "Employment Requirement",
    date: "Jul 8, 2026",
    status: "verified",
  },
  {
    id: "CERT-8211",
    type: "certificate_of_indigency",
    label: "Certificate of Indigency",
    purpose: "Scholarship Application",
    date: "Jun 15, 2026",
    status: "released",
  },
  {
    id: "CERT-7402",
    type: "business_clearance",
    label: "Business Clearance",
    purpose: "Sari-Sari Store Permit",
    date: "May 20, 2026",
    status: "approved",
  },
];

const CERT_TYPE_LABELS: Record<string, string> = {
  barangay_clearance: "Clearance",
  certificate_of_residency: "Residency",
  certificate_of_indigency: "Indigency",
  business_clearance: "Business",
  first_time_job_seeker: "First Job",
};

export default function ResidentCertificationsPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="micro-label">02 — DOCUMENT SERVICES</span>
          <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">My Certifications</h1>
          <p className="text-sm text-foreground/60 mt-1">Request official documents and track real-time release status.</p>
        </div>
        <Link href="/resident/certifications/new" className="green-chip text-xs py-2.5 px-4 inline-flex items-center gap-1.5 self-start">
          <Plus className="h-4 w-4" /> Request New Certificate
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground/40" />
          <input
            type="text"
            placeholder="Search certificate type or request number..."
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>
        <select className="px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all">
          <option value="all">All Statuses</option>
          <option value="pending">Pending/Verified</option>
          <option value="ready">Ready for Pickup</option>
          <option value="released">Released</option>
        </select>
      </div>

      {/* Requests History List */}
      <div className="space-y-4">
        {MOCK_CERTS.map((cert) => (
          <div key={cert.id} className="bryl-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#E7FFEA] border border-border flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[9px] font-bold text-foreground bg-[#C7FFCF] px-2 py-0.5 rounded uppercase">
                    {CERT_TYPE_LABELS[cert.type]}
                  </span>
                  <span className="font-mono text-[10px] text-foreground/40 font-semibold">{cert.id}</span>
                </div>
                <h3 className="font-sans font-semibold text-base text-foreground">{cert.label}</h3>
                <p className="text-xs text-foreground/60">Purpose: {cert.purpose}</p>
                <div className="flex items-center gap-1 text-[11px] text-foreground/40 font-mono">
                  <Calendar className="h-3 w-3" /> Requested on {cert.date}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
              <StatusBadge status={cert.status} />
              <Link
                href={`/resident/certifications/${cert.id}`}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:underline"
              >
                Track status <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
