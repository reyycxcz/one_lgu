import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, XCircle, ChevronRight, UserCheck, Calendar, ShieldCheck, FileCheck } from "lucide-react";

export interface TimelineStepItem {
  id: string;
  label: string;
  description?: string;
  timestamp?: string | null;
  detail?: string | null;
  actor?: string | null;
  isNegative?: boolean;
}

interface StatusTimelineProps {
  currentStatus: string;
  kind?: "certification" | "service_report" | "formal_complaint" | "report" | "workflow_submission";
  steps?: TimelineStepItem[];
  metadata?: {
    createdAt?: string;
    verifiedAt?: string | null;
    approvedAt?: string | null;
    releasedAt?: string | null;
    reviewedAt?: string | null;
    assignedAt?: string | null;
    assignedToLabel?: string | null;
    scheduledDate?: string | null;
    noticeIssuedAt?: string | null;
    noticeDetails?: string | null;
    resolvedAt?: string | null;
    resolution?: string | null;
    closedAt?: string | null;
    rejectedReason?: string | null;
    captainNotes?: string | null;
    reviewNotes?: string | null;
  };
  auditLogs?: Array<{
    action: string;
    created_at: string;
    metadata?: any;
  }>;
  className?: string;
}

export function StatusTimeline({
  currentStatus,
  kind = "certification",
  steps: customSteps,
  metadata = {},
  auditLogs = [],
  className,
}: StatusTimelineProps) {
  const normalizedStatus = (currentStatus || "submitted").toLowerCase().replace(/\s+/g, "_");

  // Helper to find log date for an action
  const findLogDate = (actionKeyword: string) => {
    const entry = auditLogs.find((l) => l.action.toLowerCase().includes(actionKeyword.toLowerCase()));
    return entry?.created_at || null;
  };

  // Build the lifecycle step definition based on kind
  let resolvedSteps: TimelineStepItem[] = [];

  if (customSteps && customSteps.length > 0) {
    resolvedSteps = customSteps;
  } else if (kind === "certification") {
    const isRejected = normalizedStatus === "rejected";

    resolvedSteps = [
      {
        id: "submitted",
        label: "Request Submitted",
        description: "Application filed and queued for barangay verification",
        timestamp: metadata.createdAt || findLogDate("submitted"),
      },
      {
        id: "verified",
        label: "Barangay Verification",
        description: "Requirements verified and identity confirmed",
        timestamp: metadata.verifiedAt || findLogDate("verified"),
      },
      {
        id: "approved",
        label: "Captain Approval",
        description: "Official clearance approved by Barangay Captain",
        timestamp: metadata.approvedAt || findLogDate("approved"),
      },
      {
        id: "released",
        label: "Ready & Released",
        description: "Document signed, sealed, and ready for pickup or digital release",
        timestamp: metadata.releasedAt || findLogDate("released"),
      },
    ];

    if (isRejected) {
      resolvedSteps = [
        resolvedSteps[0],
        {
          id: "rejected",
          label: "Request Rejected",
          description: metadata.rejectedReason || "Application did not meet requirements",
          timestamp: findLogDate("rejected") || metadata.createdAt,
          isNegative: true,
        },
      ];
    }
  } else if (kind === "service_report") {
    const isRejected = normalizedStatus === "rejected";

    resolvedSteps = [
      {
        id: "submitted",
        label: "Report Submitted",
        description: "Community concern logged with barangay",
        timestamp: metadata.createdAt || findLogDate("submitted"),
      },
      {
        id: "under_review",
        label: "Under Evaluation",
        description: "Barangay desk evaluating priority and route",
        timestamp: findLogDate("under_review"),
      },
      {
        id: "assigned",
        label: "Assigned to Unit",
        description: metadata.assignedToLabel ? `Assigned to ${metadata.assignedToLabel}` : "Field personnel dispatched",
        timestamp: metadata.assignedAt || findLogDate("assigned"),
      },
      {
        id: "in_progress",
        label: "Action Ongoing",
        description: "Corrective work or site action in progress",
        timestamp: findLogDate("in_progress"),
      },
      {
        id: "resolved",
        label: "Resolved",
        description: metadata.resolution || "Issue resolved and validated",
        timestamp: metadata.resolvedAt || findLogDate("resolved"),
      },
      {
        id: "closed",
        label: "Closed",
        description: "Report archived and case completed",
        timestamp: metadata.closedAt || findLogDate("closed"),
      },
    ];

    if (isRejected) {
      resolvedSteps = [
        resolvedSteps[0],
        {
          id: "rejected",
          label: "Report Rejected",
          description: metadata.rejectedReason || "Determined non-applicable or duplicate",
          timestamp: findLogDate("rejected") || metadata.createdAt,
          isNegative: true,
        },
      ];
    }
  } else if (kind === "formal_complaint") {
    const isRejected = normalizedStatus === "rejected";
    const isNotSettled = normalizedStatus === "not_settled";

    resolvedSteps = [
      {
        id: "submitted",
        label: "Complaint Filed",
        description: "Dispute docketed for Barangay Lupon processing",
        timestamp: metadata.createdAt || findLogDate("submitted"),
      },
      {
        id: "under_review",
        label: "Lupon Review",
        description: "Jurisdiction and parties evaluated",
        timestamp: findLogDate("under_review"),
      },
      {
        id: "notice_summons",
        label: "Notice / Summons Issued",
        description: metadata.noticeDetails || "Summons delivered to respondent",
        timestamp: metadata.noticeIssuedAt || findLogDate("notice_summons"),
      },
      {
        id: "scheduled",
        label: "Mediation Scheduled",
        description: metadata.scheduledDate
          ? `Hearing set for ${new Date(metadata.scheduledDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
          : "Mediation date fixed",
        timestamp: findLogDate("scheduled"),
      },
      {
        id: "mediation",
        label: "In Mediation / Conciliation",
        description: "Proceedings conducted before Punong Barangay / Pangkat",
        timestamp: findLogDate("mediation") || findLogDate("pangkat_conciliation"),
      },
      {
        id: "settled",
        label: isNotSettled ? "Mediation Unsettled" : "Settled / Resolved",
        description: isNotSettled
          ? "Parties did not reach settlement; next legal remedies available"
          : (metadata.resolution || "Amicable settlement signed and recorded"),
        timestamp: metadata.resolvedAt || findLogDate("settled") || findLogDate("not_settled"),
        isNegative: isNotSettled,
      },
      {
        id: "closed",
        label: "Case Closed",
        description: "Docket finalized and archived",
        timestamp: metadata.closedAt || findLogDate("closed"),
      },
    ];

    if (isRejected) {
      resolvedSteps = [
        resolvedSteps[0],
        {
          id: "rejected",
          label: "Complaint Rejected",
          description: metadata.rejectedReason || "Outside barangay jurisdiction or invalid",
          timestamp: findLogDate("rejected") || metadata.createdAt,
          isNegative: true,
        },
      ];
    }
  } else {
    // report or workflow_submission
    const isReturned = ["returned", "resubmission_required", "rejected"].includes(normalizedStatus);

    resolvedSteps = [
      {
        id: "submitted",
        label: "Report Submitted",
        description: "Document transmitted for department review",
        timestamp: metadata.createdAt || findLogDate("submitted"),
      },
      {
        id: "under_review",
        label: "Department Review",
        description: "Official evaluation and compliance check",
        timestamp: findLogDate("under_review"),
      },
      {
        id: "approved",
        label: "Approved & Verified",
        description: metadata.reviewNotes || "Submission approved and recorded in compliance ledger",
        timestamp: metadata.reviewedAt || findLogDate("approved"),
      },
    ];

    if (isReturned) {
      resolvedSteps = [
        resolvedSteps[0],
        {
          id: normalizedStatus,
          label: normalizedStatus === "resubmission_required" ? "Resubmission Required" : "Returned for Corrections",
          description: metadata.captainNotes || metadata.reviewNotes || "Please review remarks and upload corrected file",
          timestamp: findLogDate(normalizedStatus) || metadata.createdAt,
          isNegative: true,
        },
      ];
    }
  }

  // Determine current active step index
  // Map synonyms
  const statusAlias: Record<string, string> = {
    generated: "approved",
    ready_for_pickup: "released",
    resolved: "settled",
    pangkat_conciliation: "mediation",
    pending_captain_approval: "under_review",
    pending: "under_review",
    resubmitted: "submitted",
  };

  const lookupStatus = statusAlias[normalizedStatus] || normalizedStatus;
  let activeIndex = resolvedSteps.findIndex((s) => s.id === lookupStatus);

  if (activeIndex === -1) {
    // If not found directly, check if it's the last step for terminal statuses
    if (["approved", "resolved", "released", "settled", "closed"].includes(normalizedStatus)) {
      activeIndex = resolvedSteps.length - 1;
    } else {
      activeIndex = 0;
    }
  }

  return (
    <div className={cn("bg-white border border-border/80 rounded-2xl p-5 md:p-6 shadow-2xs space-y-4", className)}>
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h4 className="font-sans text-sm font-bold text-foreground">Status Timeline</h4>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          {normalizedStatus.replace(/_/g, " ").toUpperCase()}
        </span>
      </div>

      <div className="relative pt-2 pl-2">
        {resolvedSteps.map((step, idx) => {
          const isCompleted = idx < activeIndex || (idx === activeIndex && ["released", "closed", "approved"].includes(normalizedStatus) && idx === resolvedSteps.length - 1);
          const isCurrent = idx === activeIndex && !isCompleted;
          const isPending = idx > activeIndex;
          const isLast = idx === resolvedSteps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start gap-4 pb-6 last:pb-1">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute left-[13px] top-[26px] bottom-0 w-0.5 -translate-x-1/2 transition-colors duration-300",
                    isCompleted ? "bg-emerald-500" : "bg-slate-200 border-l border-dashed border-slate-300"
                  )}
                />
              )}

              {/* Status Indicator / Green Light */}
              <div className="relative z-10 shrink-0 mt-0.5">
                {step.isNegative ? (
                  <div className="h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center ring-4 ring-red-100 shadow-xs">
                    <XCircle className="h-4 w-4" />
                  </div>
                ) : isCompleted ? (
                  <div className="h-7 w-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <Check className="h-3.5 w-3.5 stroke-[3px]" />
                  </div>
                ) : isCurrent ? (
                  <div className="relative flex items-center justify-center">
                    {/* Glowing outer pulse ring for the active green light */}
                    <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping" />
                    <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-emerald-200 ring-offset-2 shadow-md">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full border-2 border-slate-300 bg-white text-slate-400 flex items-center justify-center text-xs font-mono font-bold">
                    {idx + 1}
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "text-xs font-bold leading-tight",
                        step.isNegative && "text-red-700 font-bold",
                        isCompleted && "text-foreground",
                        isCurrent && "text-emerald-800 font-extrabold",
                        isPending && "text-foreground/50 font-medium"
                      )}
                    >
                      {step.label}
                    </p>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-500 text-white shadow-2xs animate-pulse">
                        Current
                      </span>
                    )}
                  </div>

                  {step.timestamp && (
                    <span className="text-[10px] font-sans text-muted-foreground whitespace-nowrap">
                      {new Date(step.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>

                {step.description && (
                  <p
                    className={cn(
                      "text-[11px] mt-0.5 leading-relaxed",
                      step.isNegative ? "text-red-600 font-medium" : isCurrent ? "text-emerald-950 font-medium" : "text-muted-foreground"
                    )}
                  >
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
