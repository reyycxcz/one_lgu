"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function PaginationPageMinimalCenter({ page, total, onPageChange, className }: PaginationProps) {
  const pages: (number | "...")[] = [];

  if (total <= 5) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else if (page <= 3) {
    pages.push(1, 2, 3, 4, "...");
  } else if (page >= total - 2) {
    pages.push("...", total - 3, total - 2, total - 1, total);
  } else {
    pages.push("...", page - 1, page, page + 1, "...");
  }

  return (
    <div className={cn("flex items-center justify-between border-t border-border px-5 py-3", className)}>
      <p className="text-[11px] text-muted-foreground">
        Page {page} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="h-7 w-7 p-0"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`dots-${i}`} className="text-[11px] text-muted-foreground px-1">...</span>
          ) : (
            <Button
              key={p}
              variant={page === p ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              className="h-7 w-7 p-0 text-[11px]"
            >
              {p}
            </Button>
          )
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(total, page + 1))}
          disabled={page === total}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
