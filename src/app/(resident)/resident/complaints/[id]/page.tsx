import Link from "next/link";
import { ArrowLeft, Calendar, User, MapPin } from "lucide-react";
import { Stepper } from "@/components/shared/stepper";
import { StatusBadge } from "@/components/shared/status-badge";

const COMPLAINT_STEPS = [
  "submitted",
  "under_review",
  "scheduled",
  "mediation",
  "resolved",
  "closed",
];

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  // Mock complaint details
  const caseDetails = {
    id: params.id,
    subject: "Noise Complaint (Late Night Karaoke)",
    respondent: "Residential Property Block B (Barangay San Jose)",
    dateFiled: "Jul 1, 2026, 10:14 AM",
    status: "mediation",
    description:
      "Consistent late-night noise levels exceeding local limits. Karaoke activities extending past 12:00 AM on weekdays, disrupting students and senior residents in the immediate vicinity.",
    investigator: "Bgy. Kagawad Roberto Diaz",
    schedule: {
      date: "Jul 12, 2026",
      time: "10:00 AM",
      venue: "Barangay Hall Mediation Office",
    },
  };

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <span className="micro-label">03 — MEDIATION TIMELINE</span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-pixel text-4xl uppercase tracking-wider">Case Logs</h1>
          <span className="font-mono text-sm text-foreground/40">#{caseDetails.id}</span>
        </div>
      </div>

      {/* Stepper progress indicator */}
      <div className="bryl-card p-6 bg-white">
        <Stepper steps={COMPLAINT_STEPS} currentStep={caseDetails.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Case Details */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/80 pb-4">
            <span className="micro-label font-bold">CASE SUBJECT</span>
            <h3 className="text-xl font-semibold mt-1">{caseDetails.subject}</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <span className="micro-label">CASE STATUS</span>
              <div className="mt-1">
                <StatusBadge status={caseDetails.status} />
              </div>
            </div>
            <div>
              <span className="micro-label">DATE FILED</span>
              <div className="text-sm font-medium mt-1 inline-flex items-center gap-1.5 text-foreground/80">
                <Calendar className="h-4 w-4" /> {caseDetails.dateFiled}
              </div>
            </div>
          </div>

          <div>
            <span className="micro-label">RESPONDENT IDENTIFIER</span>
            <p className="text-sm font-semibold text-foreground/80 mt-1">{caseDetails.respondent}</p>
          </div>

          <div>
            <span className="micro-label">INCIDENT DESCRIPTION</span>
            <p className="text-sm text-foreground/75 mt-1 leading-relaxed">{caseDetails.description}</p>
          </div>
        </div>

        {/* Mediation schedule card */}
        <div className="space-y-6">
          {caseDetails.status === "mediation" || caseDetails.status === "scheduled" ? (
            <div className="bryl-card bg-primary/10 border-primary p-6 space-y-4">
              <h4 className="font-pixel text-lg uppercase tracking-wider text-foreground">MEDIATION SUMMONS</h4>
              
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <User className="h-4.5 w-4.5 text-foreground/60" />
                  <div>
                    <p className="font-bold">Assigned Mediator</p>
                    <p className="text-foreground/75">{caseDetails.investigator}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4.5 w-4.5 text-foreground/60" />
                  <div>
                    <p className="font-bold">Scheduled Hearing</p>
                    <p className="text-foreground/75">{caseDetails.schedule.date} @ {caseDetails.schedule.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-4.5 w-4.5 text-foreground/60" />
                  <div>
                    <p className="font-bold">Location Venue</p>
                    <p className="text-foreground/75">{caseDetails.schedule.venue}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-[10px] text-foreground/60 leading-relaxed pt-2 border-t border-border/40 font-mono">
                ATTENDANCE IS COMPULSORY FOR BOTH PARTIES UNDER LOCAL MEDIATION PROTOCOLS.
              </p>
            </div>
          ) : null}

          <div className="bryl-card-faint p-6 space-y-4">
            <h4 className="font-pixel text-lg uppercase tracking-wider">OFFICIAL ACTION LOG</h4>
            <div className="space-y-3 font-mono text-xs">
              <div className="relative pl-6 border-l border-border/80 pb-2">
                <span className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-bold text-foreground">Mediation scheduled</p>
                <p className="text-[10px] text-foreground/50">Notice of hearing issued</p>
                <p className="text-[9px] text-foreground/40">Jul 4, 2026</p>
              </div>

              <div className="relative pl-6 border-l border-border/80">
                <span className="absolute left-[-4.5px] top-1 h-2 w-2 rounded-full bg-primary" />
                <p className="font-bold text-foreground">Case evaluation completed</p>
                <p className="text-[10px] text-foreground/50">Investigator assigned</p>
                <p className="text-[9px] text-foreground/40">Jul 2, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
