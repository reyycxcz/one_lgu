import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = status.toLowerCase().replace(/_/g, " ");

  // Green Chip (highest emphasis)
  const isHighEmphasis = [
    "verified",
    "approved",
    "resolved",
    "released",
    "ready for pickup",
  ].includes(normalized);

  // Soft Accent (mid emphasis)
  const isMidEmphasis = [
    "submitted",
    "under review",
    "scheduled",
    "mediation",
  ].includes(normalized);

  // Faint Accent (low emphasis / completed state)
  const isLowEmphasis = ["generated", "closed", "archived"].includes(normalized);

  // Negative Accent
  const isNegative = ["rejected", "cancelled"].includes(normalized);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold tracking-wider uppercase rounded-full border",
        isHighEmphasis && "bg-primary text-primary-foreground border-primary shadow-[0_2px_10px_-3px_rgba(124,255,138,0.4)]",
        isMidEmphasis && "bg-[#C7FFCF] text-[#2D2A32] border-[#C7FFCF]/40",
        isLowEmphasis && "bg-[#E7FFEA] text-[#2D2A32]/70 border-[#E7FFEA]/30",
        isNegative && "bg-red-50 text-red-800 border-red-100",
        className
      )}
    >
      {isHighEmphasis && (
        <span className="h-1.5 w-1.5 rounded-full bg-[#2D2A32] animate-pulse" />
      )}
      {normalized}
    </span>
  );
}
