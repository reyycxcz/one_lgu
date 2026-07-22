"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCertificationStatus } from "@/actions/certifications";
import { updateComplaintStatus } from "@/actions/complaints";
import { reviewReport } from "@/actions/reports";
import { archiveAnnouncement } from "@/actions/announcements";
import { Check, X, FileCheck, PackageCheck, PlayCircle, Archive } from "lucide-react";

type Kind = "certification" | "complaint" | "report" | "announcement";

const BUTTON_BASE =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export function RowActions({ id, kind, status }: { id: string; kind: Kind; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function run(action: () => Promise<{ error?: unknown; data?: unknown }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Action failed");
      } else {
        router.refresh();
      }
    });
  }

  function handleReject(actionFn: (id: string, status: string, reason?: string) => Promise<any>) {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    run(() => actionFn(id, "rejected", reason || undefined));
  }

  const buttons: React.ReactNode[] = [];

  if (kind === "certification") {
    if (status === "submitted") {
      buttons.push(
        <button key="verify" disabled={isPending} onClick={() => run(() => updateCertificationStatus(id, "verified"))} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <FileCheck className="h-3 w-3" /> Verify
        </button>
      );
      buttons.push(
        <button key="reject" disabled={isPending} onClick={() => handleReject(updateCertificationStatus)} className={`${BUTTON_BASE} bg-red-50 text-red-700 hover:bg-red-100`}>
          <X className="h-3 w-3" /> Reject
        </button>
      );
    } else if (status === "verified") {
      buttons.push(
        <button key="approve" disabled={isPending} onClick={() => run(() => updateCertificationStatus(id, "approved"))} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <Check className="h-3 w-3" /> Approve
        </button>
      );
      buttons.push(
        <button key="reject" disabled={isPending} onClick={() => handleReject(updateCertificationStatus)} className={`${BUTTON_BASE} bg-red-50 text-red-700 hover:bg-red-100`}>
          <X className="h-3 w-3" /> Reject
        </button>
      );
    } else if (status === "approved" || status === "generated" || status === "ready_for_pickup") {
      buttons.push(
        <button key="release" disabled={isPending} onClick={() => run(() => updateCertificationStatus(id, "released"))} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <PackageCheck className="h-3 w-3" /> Mark Released
        </button>
      );
    }
  }

  if (kind === "complaint") {
    if (status === "submitted") {
      buttons.push(
        <button key="review" disabled={isPending} onClick={() => run(() => updateComplaintStatus(id, "under_review"))} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <PlayCircle className="h-3 w-3" /> Start Review
        </button>
      );
    } else if (["under_review", "scheduled", "mediation"].includes(status)) {
      buttons.push(
        <button
          key="resolve"
          disabled={isPending}
          onClick={() => {
            const notes = window.prompt("Resolution notes:");
            if (notes === null) return;
            run(() => updateComplaintStatus(id, "resolved", notes || undefined));
          }}
          className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}
        >
          <Check className="h-3 w-3" /> Resolve
        </button>
      );
      buttons.push(
        <button key="close" disabled={isPending} onClick={() => run(() => updateComplaintStatus(id, "closed"))} className={`${BUTTON_BASE} bg-slate-100 text-slate-700 hover:bg-slate-200`}>
          <Archive className="h-3 w-3" /> Close
        </button>
      );
    }
  }

  if (kind === "report") {
    if (status === "submitted" || status === "under_review") {
      buttons.push(
        <button key="approve" disabled={isPending} onClick={() => run(() => reviewReport(id, "approved"))} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <Check className="h-3 w-3" /> Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          disabled={isPending}
          onClick={() => {
            const notes = window.prompt("Reason for returning this report:");
            if (notes === null) return;
            run(() => reviewReport(id, "rejected", notes || undefined));
          }}
          className={`${BUTTON_BASE} bg-red-50 text-red-700 hover:bg-red-100`}
        >
          <X className="h-3 w-3" /> Return
        </button>
      );
    }
  }

  if (kind === "announcement") {
    if (status === "published") {
      buttons.push(
        <button key="archive" disabled={isPending} onClick={() => run(() => archiveAnnouncement(id))} className={`${BUTTON_BASE} bg-slate-100 text-slate-700 hover:bg-slate-200`}>
          <Archive className="h-3 w-3" /> Archive
        </button>
      );
    }
  }

  if (buttons.length === 0) {
    return <span className="text-xs text-muted-foreground/50">—</span>;
  }

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {buttons}
      {error && <span className="text-[10px] text-red-600 ml-1">{error}</span>}
    </div>
  );
}
