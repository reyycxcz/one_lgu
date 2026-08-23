import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ");

  // Positive / completed (highest emphasis)
  const isHighEmphasis = [
    "verified",
    "approved",
    "resolved",
    "released",
    "ready for pickup",
    "published",
  ].includes(normalized);

  // In progress (mid emphasis)
  const isMidEmphasis = [
    "submitted",
    "under review",
    "scheduled",
    "mediation",
    "draft",
    "pending",
    "pending captain approval",
    "resubmitted",
  ].includes(normalized);

  // Completed / neutral (low emphasis)
  const isLowEmphasis = ["generated", "closed", "archived"].includes(normalized);

  // Negative
  const isNegative = ["rejected", "cancelled", "returned", "resubmission required"].includes(normalized);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 font-sans text-[11px] font-bold capitalize rounded-full",
        isHighEmphasis && "bg-primary text-white",
        isMidEmphasis && "bg-amber-500 text-white",
        isLowEmphasis && "bg-slate-500 text-white",
        isNegative && "bg-red-600 text-white",
        className
      )}
    >
      {isHighEmphasis && (
        <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
      )}
      {normalized}
    </span>
  );
}
