"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { LguEmptyState } from "@/components/lgu/empty-state";

interface Column {
  label: string;
  align?: "left" | "right";
}

export interface FilterableRow {
  searchText: string;
  barangay?: string;
  cells: React.ReactNode[];
}

export function FilterableTable({
  columns,
  rows,
  pageSize = 10,
  emptyIcon,
  emptyMessage,
  searchPlaceholder = "Search...",
}: {
  columns: Column[];
  rows: FilterableRow[];
  pageSize?: number;
  emptyIcon: React.ReactNode;
  emptyMessage: string;
  searchPlaceholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [barangay, setBarangay] = useState("");
  const [page, setPage] = useState(1);

  const barangayOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.barangay && set.add(r.barangay));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesSearch = !q || r.searchText.toLowerCase().includes(q);
      const matchesBarangay = !barangay || r.barangay === barangay;
      return matchesSearch && matchesBarangay;
    });
  }, [rows, search, barangay]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return (
    <div>
      {(barangayOptions.length > 0 || rows.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border">
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              maxLength={100}
              className="pl-8 h-8 text-xs"
            />
          </div>
          {barangayOptions.length > 0 && (
            <select
              value={barangay}
              onChange={(e) => { setBarangay(e.target.value); setPage(1); }}
              className="h-8 rounded-md border border-input bg-white px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">All Barangays</option>
              {barangayOptions.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}
          <span className="text-[11px] text-muted-foreground ml-auto whitespace-nowrap">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {filtered.length === 0 ? (
        <LguEmptyState icon={emptyIcon} message={rows.length === 0 ? emptyMessage : "No results match your filters."} />
      ) : (
        <>
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
                  {row.cells.map((cell, j) => (
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
                Showing {start + 1}–{Math.min(start + pageSize, filtered.length)} of {filtered.length}
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
        </>
      )}
    </div>
  );
}
