"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LguEmptyState } from "@/components/lgu/empty-state";

interface Column {
  label: string;
  align?: "left" | "right";
}

export function PaginatedTable({
  columns,
  rows,
  pageSize = 10,
  emptyIcon,
  emptyMessage,
}: {
  columns: Column[];
  rows: React.ReactNode[][];
  pageSize?: number;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
}) {
  const [page, setPage] = useState(1);

  if (rows.length === 0) {
    return <LguEmptyState icon={emptyIcon} message={emptyMessage} />;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = rows.slice(start, start + pageSize);

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.label} className={col.align === "right" ? "text-right" : ""}>
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginated.map((row, i) => (
            <TableRow key={start + i}>
              {row.map((cell, j) => (
                <TableCell key={j} className={columns[j]?.align === "right" ? "text-right" : ""}>
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Showing {start + 1}–{Math.min(start + pageSize, rows.length)} of {rows.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-foreground/60 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center h-7 w-7 rounded-md border border-border text-foreground/60 hover:bg-muted/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
