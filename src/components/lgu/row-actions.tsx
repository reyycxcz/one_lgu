"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateCertificationStatus } from "@/actions/certifications";
import { updateComplaintStatus } from "@/actions/complaints";
import { reviewReport } from "@/actions/reports";
import { archiveAnnouncement } from "@/actions/announcements";
import { reviewSubmissionAction, captainDecisionAction } from "@/actions/workflow";
import { nextStatusesFor, STATUS_LABELS, RESPONSIBLE_UNITS, type ComplaintRecordType, type ComplaintStatus } from "@/lib/complaints/taxonomy";
import { Check, X, FileCheck, PackageCheck, Package, Printer, PlayCircle, Archive, Eye } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const FIELD_INPUT_CLASS =
  "w-full px-3 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";

// Copy + confirm-button wording for the three "wrap this up with a note"
// transitions — each closes out a case differently, so the prompt should
// read like the specific outcome, not a generic "notes" box.
const RESOLUTION_DIALOG_CONFIG: Partial<Record<ComplaintStatus, { title: string; description: string; label: string; placeholder: string; confirmLabel: string }>> = {
  resolved: {
    title: "Mark as Resolved",
    description: "Describe how this report was addressed before closing it out.",
    label: "Resolution details",
    placeholder: "e.g. Streetlight replaced by the maintenance crew on...",
    confirmLabel: "Mark Resolved",
  },
  settled: {
    title: "Mark as Settled",
    description: "Summarize the settlement or agreement reached between the parties.",
    label: "Settlement details",
    placeholder: "e.g. Both parties agreed to...",
    confirmLabel: "Mark Settled",
  },
  not_settled: {
    title: "Mark as Not Settled",
    description: "Explain why the case wasn't settled — this helps decide whether to reschedule or escalate to the Pangkat.",
    label: "Notes",
    placeholder: "e.g. Respondent did not appear for the scheduled hearing...",
    confirmLabel: "Mark Not Settled",
  },
};

type Kind = "certification" | "complaint" | "report" | "announcement" | "workflow_submission";

// Config for the one generic free-text dialog shared by every "type a short
// note, then confirm" action (reject reasons, mediation notes, Pangkat
// members, etc.) — avoids a bespoke dialog + state trio per action.
type TextDialogConfig = {
  title: string;
  description?: string;
  label: string;
  placeholder?: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  onSubmit: (value: string) => void;
};

const BUTTON_BASE =
  "inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

// Statuses that read as "negative"/terminal-ish get a different treatment
// than the primary "move it forward" button.
const NEGATIVE_STATUSES = new Set<string>(["rejected", "not_settled"]);
const NEUTRAL_STATUSES = new Set<string>(["closed"]);

export function RowActions({
  id,
  kind,
  status,
  recordType,
  viewHref,
}: {
  id: string;
  kind: Kind;
  status: string;
  recordType?: ComplaintRecordType;
  // Complaints/reports only: when provided, this renders as a single "View
  // & Update" link to the detail page instead of one-click status buttons —
  // staff have to actually open and read the record before a status can
  // change, rather than acting blind from a list row. Leave unset on the
  // detail page itself, where the full action set still applies.
  viewHref?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUnit, setAssignUnit] = useState(RESPONSIBLE_UNITS[0]);
  const [assignOther, setAssignOther] = useState("");
  const [assignName, setAssignName] = useState("");
  // Stable identity across renders — ConfirmDialog's focus-trap effect keys
  // off this callback, so a fresh inline arrow on every keystroke (assignName
  // changing) would re-run that effect and yank focus back to the first
  // field every time you type in the name input.
  const closeAssignDialog = useCallback(() => setAssignOpen(false), []);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesTarget, setNotesTarget] = useState<ComplaintStatus | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const closeNotesDialog = useCallback(() => setNotesOpen(false), []);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [noticeValue, setNoticeValue] = useState("");
  const closeNoticeDialog = useCallback(() => setNoticeOpen(false), []);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const closeScheduleDialog = useCallback(() => setScheduleOpen(false), []);
  const [textDialog, setTextDialog] = useState<TextDialogConfig | null>(null);
  const [textDialogValue, setTextDialogValue] = useState("");
  const closeTextDialog = useCallback(() => setTextDialog(null), []);

  function openTextDialog(config: TextDialogConfig) {
    setError(null);
    setTextDialogValue("");
    setTextDialog(config);
  }

  function confirmTextDialog() {
    if (!textDialog) return;
    const value = textDialogValue.trim();
    setTextDialog(null);
    textDialog.onSubmit(value);
  }

  // Synchronous guard, not React state — a double-click fires both event
  // handlers before a state-driven `disabled={isPending}` has re-rendered,
  // which was letting two updateComplaintStatus calls race (the second
  // landing after the first already committed, e.g. "Cannot move from
  // Resolved to Resolved"). A ref updates immediately, closing that window.
  const submittingRef = useRef(false);

  function run(action: () => Promise<{ error?: unknown; data?: unknown }>) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError(null);
    startTransition(async () => {
      const result = await action();
      submittingRef.current = false;
      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Action failed");
      } else {
        router.refresh();
      }
    });
  }

  function handleReject(actionFn: (id: string, status: string, reason?: string) => Promise<any>) {
    openTextDialog({
      title: "Reject",
      description: "Let the requester know why this is being rejected.",
      label: "Reason",
      placeholder: "Reason for rejection (optional)",
      confirmLabel: "Reject",
      variant: "destructive",
      onSubmit: (reason) => run(() => actionFn(id, "rejected", reason || undefined)),
    });
  }

  const buttons: React.ReactNode[] = [];
  let assignDialog: React.ReactNode = null;
  let resolutionDialog: React.ReactNode = null;
  let noticeDialog: React.ReactNode = null;
  let scheduleDialog: React.ReactNode = null;

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
    } else if (status === "approved") {
      buttons.push(
        <Link key="generate" href={`/barangay/certifications/${id}/generate`} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <Printer className="h-3 w-3" /> Generate & Print
        </Link>
      );
    } else if (status === "generated") {
      buttons.push(
        <Link key="reprint" href={`/barangay/certifications/${id}/generate`} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <Printer className="h-3 w-3" /> Reprint
        </Link>
      );
      buttons.push(
        <button key="ready" disabled={isPending} onClick={() => run(() => updateCertificationStatus(id, "ready_for_pickup"))} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <Package className="h-3 w-3" /> Ready for Pickup
        </button>
      );
    } else if (status === "ready_for_pickup") {
      buttons.push(
        <Link key="reprint" href={`/barangay/certifications/${id}/generate`} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <Printer className="h-3 w-3" /> Reprint
        </Link>
      );
      buttons.push(
        <button key="release" disabled={isPending} onClick={() => run(() => updateCertificationStatus(id, "released"))} className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}>
          <PackageCheck className="h-3 w-3" /> Mark Released
        </button>
      );
    } else if (status === "released") {
      buttons.push(
        <Link key="reprint" href={`/barangay/certifications/${id}/generate`} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <Printer className="h-3 w-3" /> Reprint
        </Link>
      );
    }
  }

  if (kind === "complaint" && recordType && viewHref) {
    const nextOptions = nextStatusesFor(recordType, status as ComplaintStatus);
    return nextOptions.length === 0 ? (
      <span className="text-xs text-muted-foreground/50">—</span>
    ) : (
      <div className="flex items-center justify-end">
        <Link href={viewHref} className={`${BUTTON_BASE} bg-secondary text-primary hover:bg-secondary/70`}>
          <Eye className="h-3 w-3" /> View & Update
        </Link>
      </div>
    );
  }

  if (kind === "complaint" && recordType) {
    // Driven entirely by taxonomy.ts's transition map, so the buttons shown
    // here can never drift out of sync with what updateComplaintStatus
    // actually allows — a service report will never even render a
    // mediation/Pangkat button, since those statuses aren't in its map.
    const nextOptions = nextStatusesFor(recordType, status as ComplaintStatus);

    function handleComplaintTransition(next: ComplaintStatus) {
      let extra: Parameters<typeof updateComplaintStatus>[2] = {};

      if (next === "assigned") {
        setError(null);
        setAssignUnit(RESPONSIBLE_UNITS[0]);
        setAssignOther("");
        setAssignName("");
        setAssignOpen(true);
        return;
      } else if (next === "rejected") {
        openTextDialog({
          title: "Mark Not Applicable",
          description: "Explain why this report doesn't require further action.",
          label: "Reason",
          placeholder: "e.g. Duplicate of an existing report...",
          confirmLabel: "Reject",
          variant: "destructive",
          onSubmit: (notes) => run(() => updateComplaintStatus(id, "rejected", { notes: notes || undefined })),
        });
        return;
      } else if (next === "notice_summons") {
        setError(null);
        setNoticeValue("");
        setNoticeOpen(true);
        return;
      } else if (next === "scheduled") {
        setError(null);
        setScheduleDate("");
        setScheduleOpen(true);
        return;
      } else if (next === "mediation") {
        openTextDialog({
          title: "Start Mediation",
          description: "Add any notes about the mediation session (optional).",
          label: "Mediation notes",
          placeholder: "e.g. Both parties present, discussion ongoing...",
          confirmLabel: "Start Mediation",
          onSubmit: (notes) => run(() => updateComplaintStatus(id, "mediation", { notes: notes || undefined })),
        });
        return;
      } else if (next === "pangkat_conciliation") {
        openTextDialog({
          title: "Refer to Pangkat ng Tagapagsundo",
          description: "List the Pangkat members handling this case (optional).",
          label: "Pangkat members",
          placeholder: "e.g. Kagawad Santos, Kagawad Reyes, Barangay Captain...",
          confirmLabel: "Refer to Pangkat",
          onSubmit: (members) => run(() => updateComplaintStatus(id, "pangkat_conciliation", { pangkatMembers: members || undefined })),
        });
        return;
      } else if (next === "settled" || next === "resolved" || next === "not_settled") {
        setError(null);
        setNotesTarget(next);
        setNotesValue("");
        setNotesOpen(true);
        return;
      }

      run(() => updateComplaintStatus(id, next, extra));
    }

    function confirmAssign() {
      const unit = assignUnit === "Other" ? assignOther.trim() : assignUnit;
      if (!unit) { setError("Select or specify the responsible unit"); return; }
      const label = assignName.trim() ? `${unit} — ${assignName.trim()}` : unit;
      setAssignOpen(false);
      run(() => updateComplaintStatus(id, "assigned", { assignedToLabel: label }));
    }

    function confirmNotes() {
      if (!notesTarget) return;
      const notes = notesValue.trim();
      setNotesOpen(false);
      run(() => updateComplaintStatus(id, notesTarget, { notes: notes || undefined }));
    }

    function confirmNotice() {
      setNoticeOpen(false);
      run(() => updateComplaintStatus(id, "notice_summons", { noticeDetails: noticeValue.trim() || undefined }));
    }

    function confirmSchedule() {
      if (!scheduleDate || Number.isNaN(new Date(scheduleDate).getTime())) {
        setError("Select a valid hearing date");
        return;
      }
      setScheduleOpen(false);
      run(() => updateComplaintStatus(id, "scheduled", { scheduledDate: scheduleDate }));
    }

    nextOptions.forEach((next) => {
      const isNegative = NEGATIVE_STATUSES.has(next);
      const isNeutral = NEUTRAL_STATUSES.has(next);
      buttons.push(
        <button
          key={next}
          disabled={isPending}
          onClick={() => handleComplaintTransition(next)}
          className={`${BUTTON_BASE} ${
            isNegative ? "bg-red-50 text-red-700 hover:bg-red-100" : isNeutral ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-secondary text-primary hover:bg-secondary/70"
          }`}
        >
          {isNegative ? <X className="h-3 w-3" /> : isNeutral ? <Archive className="h-3 w-3" /> : <PlayCircle className="h-3 w-3" />} {STATUS_LABELS[next]}
        </button>
      );
    });

    if (nextOptions.includes("assigned")) {
      assignDialog = (
        <ConfirmDialog
          open={assignOpen}
          title="Assign Report"
          description="There are no individual accounts for tanod, kagawad, or other barangay personnel — pick who this is being handed to so it can be tracked."
          confirmLabel="Assign"
          loading={isPending}
          onConfirm={confirmAssign}
          onCancel={closeAssignDialog}
        >
          <div className="space-y-4">
            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">Responsible unit</label>
              <select value={assignUnit} onChange={(e) => setAssignUnit(e.target.value)} className={FIELD_INPUT_CLASS}>
                {RESPONSIBLE_UNITS.map((unit) => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            {assignUnit === "Other" && (
              <div>
                <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">Specify unit</label>
                <input
                  type="text"
                  value={assignOther}
                  onChange={(e) => setAssignOther(e.target.value)}
                  placeholder="e.g. Barangay Nutrition Scholar"
                  className={FIELD_INPUT_CLASS}
                  autoFocus
                />
              </div>
            )}
            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">
                Assigned to <span className="text-foreground/40 font-normal">(name, optional)</span>
              </label>
              <input
                type="text"
                value={assignName}
                onChange={(e) => setAssignName(e.target.value)}
                placeholder="e.g. Juan Dela Cruz"
                className={FIELD_INPUT_CLASS}
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>
        </ConfirmDialog>
      );
    }

    if (nextOptions.some((n) => n in RESOLUTION_DIALOG_CONFIG)) {
      const cfg = notesTarget ? RESOLUTION_DIALOG_CONFIG[notesTarget] : undefined;
      resolutionDialog = (
        <ConfirmDialog
          open={notesOpen}
          title={cfg?.title ?? "Add Details"}
          description={cfg?.description}
          confirmLabel={cfg?.confirmLabel ?? "Confirm"}
          loading={isPending}
          onConfirm={confirmNotes}
          onCancel={closeNotesDialog}
        >
          <div>
            <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">
              {cfg?.label ?? "Notes"} <span className="text-foreground/40 font-normal">(optional)</span>
            </label>
            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder={cfg?.placeholder}
              rows={4}
              autoFocus
              className={`${FIELD_INPUT_CLASS} resize-y min-h-[90px]`}
            />
          </div>
        </ConfirmDialog>
      );
    }

    if (nextOptions.includes("notice_summons")) {
      noticeDialog = (
        <ConfirmDialog
          open={noticeOpen}
          title="Issue Notice / Summons"
          description="Record the notice or summons details before it's formally issued to the parties."
          confirmLabel="Issue Notice"
          loading={isPending}
          onConfirm={confirmNotice}
          onCancel={closeNoticeDialog}
        >
          <div>
            <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">
              Notice / summons details <span className="text-foreground/40 font-normal">(optional)</span>
            </label>
            <textarea
              value={noticeValue}
              onChange={(e) => setNoticeValue(e.target.value)}
              placeholder="e.g. First notice sent to both parties, response due within 5 days..."
              rows={4}
              autoFocus
              className={`${FIELD_INPUT_CLASS} resize-y min-h-[90px]`}
            />
          </div>
        </ConfirmDialog>
      );
    }

    if (nextOptions.includes("scheduled")) {
      scheduleDialog = (
        <ConfirmDialog
          open={scheduleOpen}
          title="Schedule Mediation"
          description="Set the date this case will be heard for mediation."
          confirmLabel="Schedule"
          loading={isPending}
          onConfirm={confirmSchedule}
          onCancel={closeScheduleDialog}
        >
          <div>
            <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">Mediation hearing date</label>
            <input
              type="date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              className={FIELD_INPUT_CLASS}
              autoFocus
            />
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </div>
        </ConfirmDialog>
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
          onClick={() =>
            openTextDialog({
              title: "Return Report",
              description: "Let the submitter know what needs to be fixed before resubmitting.",
              label: "Reason",
              placeholder: "Reason for returning this report (optional)",
              confirmLabel: "Return",
              variant: "destructive",
              onSubmit: (notes) => run(() => reviewReport(id, "returned", notes || undefined)),
            })
          }
          className={`${BUTTON_BASE} bg-red-50 text-red-700 hover:bg-red-100`}
        >
          <X className="h-3 w-3" /> Return
        </button>
      );
    }
  }

  if (kind === "workflow_submission") {
    if (status === "submitted" || status === "under_review" || status === "resubmitted") {
      buttons.push(
        <button
          key="approve"
          disabled={isPending}
          onClick={() => run(() => reviewSubmissionAction(id, "approved"))}
          className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}
        >
          <Check className="h-3 w-3" /> Approve
        </button>
      );
      buttons.push(
        <button
          key="reject"
          disabled={isPending}
          onClick={() =>
            openTextDialog({
              title: "Return Submission",
              description: "Let the submitter know what needs to be fixed before resubmitting.",
              label: "Reason",
              placeholder: "Reason for returning this submission (optional)",
              confirmLabel: "Return",
              variant: "destructive",
              onSubmit: (notes) => run(() => reviewSubmissionAction(id, "returned", notes || undefined)),
            })
          }
          className={`${BUTTON_BASE} bg-red-50 text-red-700 hover:bg-red-100`}
        >
          <X className="h-3 w-3" /> Return
        </button>
      );
    } else if (status === "pending_captain_approval") {
      buttons.push(
        <button
          key="captain-approve"
          disabled={isPending}
          onClick={() => run(() => captainDecisionAction(id, "approved"))}
          className={`${BUTTON_BASE} bg-primary text-white hover:bg-primary/90`}
        >
          <Check className="h-3 w-3" /> Approve
        </button>
      );
      buttons.push(
        <button
          key="captain-reject"
          disabled={isPending}
          onClick={() =>
            openTextDialog({
              title: "Return to Secretary",
              description: "Let the Secretary know what needs to be fixed before resubmitting.",
              label: "Reason",
              placeholder: "Reason for returning this document (optional)",
              confirmLabel: "Return",
              variant: "destructive",
              onSubmit: (notes) => run(() => captainDecisionAction(id, "returned", notes || undefined)),
            })
          }
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
      {assignDialog}
      {resolutionDialog}
      {noticeDialog}
      {scheduleDialog}
      <ConfirmDialog
        open={!!textDialog}
        title={textDialog?.title ?? ""}
        description={textDialog?.description}
        confirmLabel={textDialog?.confirmLabel ?? "Confirm"}
        variant={textDialog?.variant ?? "default"}
        loading={isPending}
        onConfirm={confirmTextDialog}
        onCancel={closeTextDialog}
      >
        <div>
          <label className="block font-sans text-xs font-semibold text-foreground/75 mb-1.5">
            {textDialog?.label ?? "Notes"} <span className="text-foreground/40 font-normal">(optional)</span>
          </label>
          <textarea
            value={textDialogValue}
            onChange={(e) => setTextDialogValue(e.target.value)}
            placeholder={textDialog?.placeholder}
            rows={4}
            autoFocus
            className={`${FIELD_INPUT_CLASS} resize-y min-h-[90px]`}
          />
        </div>
      </ConfirmDialog>
    </div>
  );
}
