"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBarangayActive } from "@/actions/barangays";
import { CheckCircle2, XCircle } from "lucide-react";

export function BarangayToggleActive({ barangayId, isActive }: { barangayId: string; isActive: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await toggleBarangayActive(barangayId, !isActive);
      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Action failed");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        disabled={isPending}
        onClick={handleClick}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive ? "bg-red-50 text-red-700 hover:bg-red-100" : "bg-primary text-white hover:bg-primary/90"
        }`}
      >
        {isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
        {isActive ? "Deactivate" : "Activate"}
      </button>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
