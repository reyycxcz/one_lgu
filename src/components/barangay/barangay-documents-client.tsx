"use client";

import { useMemo, useState } from "react";
import { FilterableTable } from "@/components/lgu/filterable-table";
import { FolderOpen } from "lucide-react";

interface DocumentRow {
  periodLabel: string;
  row: {
    searchText: string;
    cells: React.ReactNode[];
  };
}

interface BarangayDocumentsClientProps {
  initialRows: DocumentRow[];
}

export function BarangayDocumentsClient({ initialRows }: BarangayDocumentsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All Periods");

  // Extract unique periods present in the rows in sorted order (inherited from initialRows sorting)
  const periods = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.periodLabel) set.add(r.periodLabel);
    });
    return Array.from(set);
  }, [initialRows]);

  // Filter rows by period
  const filteredRows = useMemo(() => {
    if (selectedPeriod === "All Periods") return initialRows.map((r) => r.row);
    return initialRows.filter((r) => r.periodLabel === selectedPeriod).map((r) => r.row);
  }, [initialRows, selectedPeriod]);

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/60 shadow-xs">
        <span className="text-xs font-bold text-muted-foreground">
          Filter documents by covered period:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Reporting Period:
          </span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold cursor-pointer"
          >
            <option value="All Periods">All Periods</option>
            {periods.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bryl-card p-0">
        <FilterableTable
          columns={[
            { label: "Request" },
            { label: "Type" },
            { label: "Department" },
            { label: "Covered Period" },
            { label: "Deadline" },
            { label: "Status", align: "right" },
          ]}
          rows={filteredRows}
          emptyIcon={<FolderOpen />}
          emptyMessage="No documents match the selected filters."
          searchPlaceholder="Search by title, type, or department..."
        />
      </div>
    </div>
  );
}
