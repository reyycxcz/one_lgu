"use client";

import { useMemo, useState } from "react";
import { FilterableTable } from "@/components/lgu/filterable-table";
import { FolderOpen } from "lucide-react";

interface DocumentRow {
  year: string;
  row: {
    searchText: string;
    cells: React.ReactNode[];
  };
}

interface BarangayDocumentsClientProps {
  initialRows: DocumentRow[];
}

export function BarangayDocumentsClient({ initialRows }: BarangayDocumentsClientProps) {
  const [selectedYear, setSelectedYear] = useState<string>("All Years");

  // Extract unique years present in the rows
  const years = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.year) set.add(r.year);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [initialRows]);

  // Filter rows by year
  const filteredRows = useMemo(() => {
    if (selectedYear === "All Years") return initialRows.map((r) => r.row);
    return initialRows.filter((r) => r.year === selectedYear).map((r) => r.row);
  }, [initialRows, selectedYear]);

  return (
    <div className="space-y-6">
      {/* Year Filter Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/60 shadow-xs">
        <span className="text-xs font-bold text-muted-foreground">
          Filter documents by covered year:
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
            Reporting Year:
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold cursor-pointer"
          >
            <option value="All Years">All Years</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
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
