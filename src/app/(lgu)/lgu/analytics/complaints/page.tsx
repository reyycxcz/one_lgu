import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { CategoryBarChart } from "@/components/lgu/charts/category-bar-chart";

export default async function ComplaintAnalyticsPage() {
  const supabase = await createClient();
  const { data: complaints } = await supabase.from("complaints").select("type");

  const counts = new Map<string, number>();
  (complaints || []).forEach((c) => counts.set(c.type, (counts.get(c.type) || 0) + 1));

  const data = Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Complaint Analytics"
        description="Monitor complaint volume by category."
      />
      <CategoryBarChart
        title="Complaints by Category"
        description="Total complaints filed per category"
        data={data}
      />
    </div>
  );
}
