"use client";

import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable } from "@/components/lgu/filterable-table";
import { FileText } from "lucide-react";

interface DocumentRow {
  recurrence: string;
  periodLabel: string;
  dateStr: string;
  row: {
    searchText: string;
    barangay?: string;
    cells: React.ReactNode[];
  };
}

interface FrequencyTabsClientProps {
  initialRows: DocumentRow[];
}

export function FrequencyTabsClient({ initialRows }: FrequencyTabsClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("All Periods");
  const [activeTab, setActiveTab] = useState<string>("monthly");

  // Extract unique periods present in the rows for the active tab's recurrence in sorted order
  const periods = useMemo(() => {
    const set = new Set<string>();
    initialRows.forEach((r) => {
      if (r.recurrence === activeTab && r.periodLabel) {
        set.add(r.periodLabel);
      }
    });
    return Array.from(set);
  }, [initialRows, activeTab]);

  // Filter rows by period
  const filteredRows = useMemo(() => {
    if (selectedPeriod === "All Periods") return initialRows;
    return initialRows.filter((r) => r.periodLabel === selectedPeriod);
  }, [initialRows, selectedPeriod]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedPeriod("All Periods");
  };

  // Split into recurrence groups
  const monthlyRows = useMemo(() => filteredRows.filter((r) => r.recurrence === "monthly").map((r) => r.row), [filteredRows]);
  const quarterlyRows = useMemo(() => filteredRows.filter((r) => r.recurrence === "quarterly").map((r) => r.row), [filteredRows]);
  const annualRows = useMemo(() => filteredRows.filter((r) => r.recurrence === "annual").map((r) => r.row), [filteredRows]);
  const oneTimeRows = useMemo(() => filteredRows.filter((r) => r.recurrence === "one_time").map((r) => r.row), [filteredRows]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Filter & Tabs Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-border/60 shadow-xs mb-6">
          <TabsList className="grid grid-cols-4 w-full sm:max-w-xl bg-slate-100 rounded-lg p-1 h-10">
            <TabsTrigger value="monthly" className="text-xs font-semibold rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:text-foreground">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="quarterly" className="text-xs font-semibold rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:text-foreground">
              Quarterly
            </TabsTrigger>
            <TabsTrigger value="annual" className="text-xs font-semibold rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:text-foreground">
              Annual
            </TabsTrigger>
            <TabsTrigger value="one_time" className="text-xs font-semibold rounded-md py-1.5 data-[state=active]:bg-white data-[state=active]:text-foreground">
              One-Time / Ad-Hoc
            </TabsTrigger>
          </TabsList>

          {/* Period Selector */}
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

        <TabsContent value="monthly">
          <Card className="border border-border/60">
            <CardContent className="p-0">
              <FilterableTable
                columns={[
                  { label: "File" },
                  { label: "Related Request / Report" },
                  { label: "Covered Period" },
                  { label: "Barangay" },
                  { label: "Requesting Department" },
                  { label: "Date Submitted" },
                  { label: "Status", align: "right" },
                  { label: "Actions", align: "right" },
                ]}
                rows={monthlyRows}
                emptyIcon={<FileText />}
                emptyMessage="No monthly submissions found."
                searchPlaceholder="Search monthly files or reports..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly">
          <Card className="border border-border/60">
            <CardContent className="p-0">
              <FilterableTable
                columns={[
                  { label: "File" },
                  { label: "Related Request / Report" },
                  { label: "Covered Period" },
                  { label: "Barangay" },
                  { label: "Requesting Department" },
                  { label: "Date Submitted" },
                  { label: "Status", align: "right" },
                  { label: "Actions", align: "right" },
                ]}
                rows={quarterlyRows}
                emptyIcon={<FileText />}
                emptyMessage="No quarterly submissions found."
                searchPlaceholder="Search quarterly files or reports..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual">
          <Card className="border border-border/60">
            <CardContent className="p-0">
              <FilterableTable
                columns={[
                  { label: "File" },
                  { label: "Related Request / Report" },
                  { label: "Covered Period" },
                  { label: "Barangay" },
                  { label: "Requesting Department" },
                  { label: "Date Submitted" },
                  { label: "Status", align: "right" },
                  { label: "Actions", align: "right" },
                ]}
                rows={annualRows}
                emptyIcon={<FileText />}
                emptyMessage="No annual submissions found."
                searchPlaceholder="Search annual files or reports..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="one_time">
          <Card className="border border-border/60">
            <CardContent className="p-0">
              <FilterableTable
                columns={[
                  { label: "File" },
                  { label: "Related Request / Report" },
                  { label: "Covered Period" },
                  { label: "Barangay" },
                  { label: "Requesting Department" },
                  { label: "Date Submitted" },
                  { label: "Status", align: "right" },
                  { label: "Actions", align: "right" },
                ]}
                rows={oneTimeRows}
                emptyIcon={<FileText />}
                emptyMessage="No one-time submissions found."
                searchPlaceholder="Search one-time files or reports..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
