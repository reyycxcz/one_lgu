import { createClient } from "@/lib/supabase/server";
import { LGUSectionCards } from "@/components/lgu-section-cards";
import { SubmissionsTrendChart } from "@/components/lgu/charts/submissions-trend-chart";
import { CategoryBarChart } from "@/components/lgu/charts/category-bar-chart";
import { CategoryPieChart } from "@/components/lgu/charts/category-pie-chart";
import { ComplianceTrendChart } from "@/components/lgu/charts/compliance-trend-chart";

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function lastNMonths(n: number) {
  const months: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }
  return months;
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since6mo = new Date();
  since6mo.setMonth(since6mo.getMonth() - 5, 1);

  const [{ data: reports }, { data: certs }, { data: complaints }, { data: complianceReports }] = await Promise.all([
    supabase.from("reports").select("created_at").gte("created_at", since30.toISOString()),
    supabase.from("certification_requests").select("created_at, type").gte("created_at", since30.toISOString()),
    supabase.from("complaints").select("created_at, type").gte("created_at", since30.toISOString()),
    supabase.from("reports").select("status, created_at").gte("created_at", since6mo.toISOString()),
  ]);

  const days = lastNDays(30);
  const dayCounts = new Map(days.map((d) => [d, { reports: 0, certifications: 0, complaints: 0 }]));
  (reports || []).forEach((r) => { const e = dayCounts.get(r.created_at.slice(0, 10)); if (e) e.reports++; });
  (certs || []).forEach((c) => { const e = dayCounts.get(c.created_at.slice(0, 10)); if (e) e.certifications++; });
  (complaints || []).forEach((c) => { const e = dayCounts.get(c.created_at.slice(0, 10)); if (e) e.complaints++; });
  const trendData = days.map((date) => ({ date, ...dayCounts.get(date)! }));

  const complaintCounts = new Map<string, number>();
  (complaints || []).forEach((c) => complaintCounts.set(c.type, (complaintCounts.get(c.type) || 0) + 1));
  const complaintData = Array.from(complaintCounts.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);

  const certCounts = new Map<string, number>();
  (certs || []).forEach((c) => certCounts.set(c.type, (certCounts.get(c.type) || 0) + 1));
  const certData = Array.from(certCounts.entries()).map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count);

  const months = lastNMonths(6);
  const monthStats = new Map(months.map((m) => [m.key, { total: 0, approved: 0 }]));
  (complianceReports || []).forEach((r) => {
    const s = monthStats.get(r.created_at.slice(0, 7));
    if (!s) return;
    s.total++;
    if (r.status === "approved") s.approved++;
  });
  const complianceData = months.map((m) => {
    const s = monthStats.get(m.key)!;
    return { month: m.label, approvalRate: s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl text-foreground tracking-tight">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Municipal-wide compliance and activity summary</p>
      </div>

      <LGUSectionCards />
      <SubmissionsTrendChart data={trendData} />

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBarChart
          title="Complaints by Category (30d)"
          description="Complaint volume by category, last 30 days"
          data={complaintData}
        />
        <CategoryPieChart
          title="Certifications by Type (30d)"
          description="Request distribution by type, last 30 days"
          data={certData}
        />
      </div>

      <ComplianceTrendChart data={complianceData} />
    </div>
  );
}
