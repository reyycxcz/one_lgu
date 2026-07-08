import Link from "next/link";
import { ArrowLeft, Calendar, ShieldCheck } from "lucide-react";
import { Stepper } from "@/components/shared/stepper";
import { StatusBadge } from "@/components/shared/status-badge";

const CERTIFICATION_STEPS = [
  "submitted",
  "verified",
  "approved",
  "generated",
  "ready_for_pickup",
  "released",
];

export default function CertificationDetailPage({ params }: { params: { id: string } }) {
  // Mock details matching tracking number
  const certDetails = {
    id: params.id,
    type: "Barangay Clearance",
    purpose: "Employment Requirement (Local)",
    dateRequested: "Jul 8, 2026, 09:12 AM",
    status: "verified",
    requirements: [
      { name: "Government Photo ID (Passport)", size: "1.2 MB", status: "Approved" },
      { name: "Proof of Residency (Utility Bill)", size: "870 KB", status: "Approved" },
    ],
    verifiedBy: "Sgt. Jose Martinez (Barangay Clerk)",
    verifiedAt: "Jul 8, 2026, 11:30 AM",
  };

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <span className="micro-label">02 — REAL-TIME CASE ROUTER</span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-pixel text-4xl uppercase tracking-wider">Request Tracking</h1>
          <span className="font-mono text-sm text-foreground/40">#{certDetails.id}</span>
        </div>
      </div>

      {/* Stepper progress indicator */}
      <div className="bryl-card p-6 bg-white">
        <Stepper steps={CERTIFICATION_STEPS} currentStep={certDetails.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Detail Specifications */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/80 pb-4">
            <span className="micro-label font-bold">DOCUMENT TYPE</span>
            <h3 className="text-xl font-semibold mt-1">{certDetails.type}</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="micro-label">STATUS CODE</span>
              <div className="mt-1">
                <StatusBadge status={certDetails.status} />
              </div>
            </div>
            <div>
              <span className="micro-label">DATE REQUESTED</span>
              <div className="text-sm font-medium mt-1 inline-flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-4 w-4" /> {certDetails.dateRequested}
              </div>
            </div>
          </div>

          <div>
            <span className="micro-label">PURPOSE SPECIFICATION</span>
            <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{certDetails.purpose}</p>
          </div>

          {/* Uploaded attachments */}
          <div className="space-y-3">
            <span className="micro-label">VERIFIED ATTACHMENTS</span>
            <div className="space-y-2">
              {certDetails.requirements.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border/60 rounded-xl">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold">{file.name}</span>
                  </div>
                  <span className="font-mono text-[10px] text-foreground/45 uppercase">{file.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status log timeline */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h4 className="font-pixel text-lg uppercase tracking-wider">VERIFICATION LOGS</h4>
            
            <div className="space-y-4 font-mono text-xs">
              <div className="relative pl-6 border-l border-border/80 pb-2">
                <span className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-bold text-foreground">Verified by Barangay staff</p>
                <p className="text-[10px] text-foreground/50">{certDetails.verifiedBy}</p>
                <p className="text-[9px] text-foreground/40 mt-0.5">{certDetails.verifiedAt}</p>
              </div>

              <div className="relative pl-6 border-l border-border/80 pb-2">
                <span className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-bold text-foreground">Submitted by Resident</p>
                <p className="text-[10px] text-foreground/50">Via Online Citizen Portal</p>
                <p className="text-[9px] text-foreground/40 mt-0.5">{certDetails.dateRequested}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
