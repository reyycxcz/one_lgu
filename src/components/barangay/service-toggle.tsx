"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleBarangayServiceStatus } from "@/actions/barangays";
import { Power, CheckCircle2, XCircle } from "lucide-react";

interface BarangayServiceToggleProps {
  barangayId: string;
  barangayName: string;
  initialIsOpen: boolean;
  canToggle: boolean;
}

export function BarangayServiceToggle({
  barangayId,
  barangayName,
  initialIsOpen,
  canToggle,
}: BarangayServiceToggleProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [prevInitialIsOpen, setPrevInitialIsOpen] = useState(initialIsOpen);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (initialIsOpen !== prevInitialIsOpen) {
    setPrevInitialIsOpen(initialIsOpen);
    setIsOpen(initialIsOpen);
  }

  function handleToggle() {
    if (!canToggle || isPending) return;
    const nextState = !isOpen;
    setIsOpen(nextState);
    setError(null);

    startTransition(async () => {
      const result = await toggleBarangayServiceStatus(barangayId, nextState);
      if (result?.error) {
        setIsOpen(!nextState); // Revert on failure
        setError(typeof result.error === "string" ? result.error : "Failed to update service status");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl border transition-all duration-300 p-4 sm:p-5 ${
        isOpen
          ? "border-emerald-300/80 bg-gradient-to-r from-emerald-50 via-emerald-50/40 to-white text-emerald-950 shadow-xs"
          : "border-rose-300/80 bg-gradient-to-r from-rose-50 via-rose-50/40 to-white text-rose-950 shadow-xs"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
              isOpen ? "bg-emerald-500/15 text-emerald-600" : "bg-rose-500/15 text-rose-600"
            }`}
          >
            {isOpen ? (
              <CheckCircle2 className="h-5 w-5 animate-pulse text-emerald-600" />
            ) : (
              <XCircle className="h-5 w-5 text-rose-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold tracking-tight font-sans">
                {barangayName ? `${barangayName} — ` : ""}Barangay Service Availability
              </h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isOpen ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                }`}
              >
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <p className="text-xs text-foreground/65 mt-1">
              {isOpen
                ? "Barangay Hall is currently Open and accepting resident requests and reports in real time."
                : "Barangay Hall is currently Closed / Off-Duty. Residents are informed that services are closed."}
            </p>
            {error && (
              <p className="text-xs text-rose-600 font-semibold mt-1.5">{error}</p>
            )}
          </div>
        </div>

        {canToggle ? (
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <span className="text-xs font-semibold text-foreground/75 hidden sm:inline">
              {isOpen ? "Switch to Closed" : "Switch to Open"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isOpen}
              disabled={isPending}
              onClick={handleToggle}
              title={isOpen ? "Click to set status to Closed" : "Click to set status to Open"}
              className={`relative inline-flex h-8 w-16 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                isOpen ? "bg-emerald-600" : "bg-rose-400"
              }`}
            >
              <span className="sr-only">Toggle Barangay Service Availability</span>
              <span
                className={`pointer-events-none inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isOpen ? "translate-x-8 text-emerald-600" : "translate-x-0 text-rose-600"
                }`}
              >
                <Power className="h-3.5 w-3.5 stroke-[2.5]" />
              </span>
            </button>
          </div>
        ) : (
          <div className="text-right shrink-0">
            <span className="text-[11px] text-muted-foreground font-medium italic">
              Managed by Captain / Secretary
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
