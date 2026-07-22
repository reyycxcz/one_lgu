import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { CategoryPieChart } from "@/components/lgu/charts/category-pie-chart";

export default async function CertificationAnalyticsPage() {
  const supabase = await createClient();
  const { data: requests } = await supabase.from("certification_requests").select("type");

  const counts = new Map<string, number>();
  (requests || []).forEach((r) => counts.set(r.type, (counts.get(r.type) || 0) + 1));

  const data = Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Certification Analytics"
        description="View certification request distribution by type."
      />
      <CategoryPieChart
        title="Requests by Type"
        description="Share of each certification type among all requests"
        data={data}
      />
    </div>
  );
}
