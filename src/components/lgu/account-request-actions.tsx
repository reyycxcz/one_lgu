"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { approveAccountRequest, rejectAccountRequest } from "@/actions/profile";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AccountRequestActions({ userId }: { userId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  function approve() {
    setError(null);
    startTransition(async () => {
      const res = await approveAccountRequest(userId);
      if (res?.error) setError(typeof res.error === "string" ? res.error : "Failed");
      else router.refresh();
    });
  }

  function reject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectAccountRequest(userId, reason.trim());
      if (res?.error) {
        setError(typeof res.error === "string" ? res.error : "Failed");
      } else {
        setRejectOpen(false);
        setReason("");
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={approve}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        <Check className="h-3 w-3" /> Approve
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => setRejectOpen(true)}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
      >
        <X className="h-3 w-3" /> Reject
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}

      <ConfirmDialog
        open={rejectOpen}
        variant="destructive"
        title="Reject this account request?"
        description="The account stays deactivated and the user is notified. You can add an optional reason below."
        confirmLabel="Reject Request"
        cancelLabel="Cancel"
        loading={isPending}
        onConfirm={reject}
        onCancel={() => setRejectOpen(false)}
      >
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Optional reason (shown to the user)"
          className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </ConfirmDialog>
    </div>
  );
}
