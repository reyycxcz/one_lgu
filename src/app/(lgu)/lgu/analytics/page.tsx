import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LGUSectionCards } from "@/components/lgu-section-cards";
import { SubmissionsTrendChart } from "@/components/lgu/charts/submissions-trend-chart";
import { CategoryBarChart } from "@/components/lgu/charts/category-bar-chart";
import { CategoryPieChart } from "@/components/lgu/charts/category-pie-chart";

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function LguAnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [{ data: reports }, { data: certs }, { data: complaints }] = await Promise.all([
    supabase.from("reports").select("created_at").gte("created_at", sinceIso),
    supabase.from("certification_requests").select("created_at, type").gte("created_at", sinceIso),
    supabase.from("complaints").select("created_at, type").gte("created_at", sinceIso),
  ]);

  const days = lastNDays(30);
  const counts = new Map(days.map((d) => [d, { reports: 0, certifications: 0, complaints: 0 }]));
  (reports || []).forEach((r) => {
    const entry = counts.get(r.created_at.slice(0, 10));
    if (entry) entry.reports++;
  });
  (certs || []).forEach((c) => {
    const entry = counts.get(c.created_at.slice(0, 10));
    if (entry) entry.certifications++;
  });
  (complaints || []).forEach((c) => {
    const entry = counts.get(c.created_at.slice(0, 10));
    if (entry) entry.complaints++;
  });
  const trendData = days.map((date) => ({ date, ...counts.get(date)! }));

  const complaintCounts = new Map<string, number>();
  (complaints || []).forEach((c) => complaintCounts.set(c.type, (complaintCounts.get(c.type) || 0) + 1));
  const complaintData = Array.from(complaintCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const certCounts = new Map<string, number>();
  (certs || []).forEach((c) => certCounts.set(c.type, (certCounts.get(c.type) || 0) + 1));
  const certData = Array.from(certCounts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Analytics"
        description="Cross-module insights across all barangays."
      />
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
    </div>
  );
}
