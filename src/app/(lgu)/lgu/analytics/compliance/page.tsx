import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { ComplianceTrendChart } from "@/components/lgu/charts/compliance-trend-chart";

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

export default async function ComplianceAnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);

  const { data: reports } = await supabase
    .from("reports")
    .select("status, created_at")
    .gte("created_at", since.toISOString());

  const months = lastNMonths(6);
  const stats = new Map(months.map((m) => [m.key, { total: 0, approved: 0 }]));

  (reports || []).forEach((r) => {
    const key = r.created_at.slice(0, 7);
    const s = stats.get(key);
    if (!s) return;
    s.total++;
    if (r.status === "approved") s.approved++;
  });

  const data = months.map((m) => {
    const s = stats.get(m.key)!;
    return { month: m.label, approvalRate: s.total > 0 ? Math.round((s.approved / s.total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Compliance Analytics"
        description="Monitor report approval compliance rates over time."
      />
      <ComplianceTrendChart data={data} />
    </div>
  );
}
