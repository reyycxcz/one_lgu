import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { CategoryBarChart } from "@/components/lgu/charts/category-bar-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardCheck, AlertTriangle } from "lucide-react";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function AnnualReportsPage() {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01T00:00:00.000Z`;
  const yearEnd = `${year + 1}-01-01T00:00:00.000Z`;

  const [{ data: reports }, { data: certs }, { data: complaints }] = await Promise.all([
    supabase.from("reports").select("created_at").gte("created_at", yearStart).lt("created_at", yearEnd),
    supabase.from("certification_requests").select("created_at").gte("created_at", yearStart).lt("created_at", yearEnd),
    supabase.from("complaints").select("created_at").gte("created_at", yearStart).lt("created_at", yearEnd),
  ]);

  const monthlyTotals = new Array(12).fill(0);
  [...(reports || []), ...(certs || []), ...(complaints || [])].forEach((row) => {
    const month = new Date(row.created_at).getMonth();
    monthlyTotals[month]++;
  });

  const data = MONTH_LABELS.map((label, i) => ({ category: label, count: monthlyTotals[i] }));

  const stats = [
    { label: "Reports This Year", value: reports?.length || 0, icon: FileText },
    { label: "Certifications This Year", value: certs?.length || 0, icon: ClipboardCheck },
    { label: "Complaints This Year", value: complaints?.length || 0, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Annual Reports"
        description={`Comprehensive ${year} performance overview across all barangays.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryBarChart
        title="Monthly Submission Volume"
        description={`Total reports, certifications, and complaints per month in ${year}`}
        data={data}
      />
    </div>
  );
}
