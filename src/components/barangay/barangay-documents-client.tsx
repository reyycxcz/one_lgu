"use client";

import { useMemo, useState } from "react";
import { FilterableTable } from "@/components/lgu/filterable-table";
import { FolderOpen } from "lucide-react";

interface DocumentRow {
  year: string;
  month?: string;
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
  const [selectedMonth, setSelectedMonth] = useState<string>("All Months");

  // Extract unique years present in the rows
  const years = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.year) set.add(r.year);
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [initialRows]);

  // Extract unique months present in the rows for the selected year
  const months = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (selectedYear === "All Years" || r.year === selectedYear) {
        if (r.month) set.add(r.month);
      }
    });
    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return Array.from(set).sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }, [initialRows, selectedYear]);

  // Filter rows by year and month
  const filteredRows = useMemo(() => {
    return initialRows
      .filter((r) => {
        const yearMatch = selectedYear === "All Years" || r.year === selectedYear;
        const monthMatch = selectedMonth === "All Months" || r.month === selectedMonth;
        return yearMatch && monthMatch;
      })
      .map((r) => r.row);
  }, [initialRows, selectedYear, selectedMonth]);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedMonth("All Months");
  };

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/60 shadow-xs">
        <span className="text-xs font-bold text-muted-foreground">
          Filter documents by covered period:
        </span>
        <div className="flex flex-wrap items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              Reporting Year:
            </span>
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(e.target.value)}
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              Reporting Month:
            </span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-9 rounded-md border border-input bg-white px-3 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs font-semibold cursor-pointer"
            >
              <option value="All Months">All Months</option>
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
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
