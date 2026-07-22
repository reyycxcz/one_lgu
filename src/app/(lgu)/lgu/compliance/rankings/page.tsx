import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Award } from "lucide-react";

export default async function BarangayRankingsPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: reports }] = await Promise.all([
    supabase.from("barangays").select("id, name").eq("is_active", true),
    supabase.from("reports").select("barangay_id, status"),
  ]);

  const stats = new Map<string, { total: number; approved: number }>();
  (reports || []).forEach((r) => {
    if (!r.barangay_id) return;
    const s = stats.get(r.barangay_id) || { total: 0, approved: 0 };
    s.total++;
    if (r.status === "approved") s.approved++;
    stats.set(r.barangay_id, s);
  });

  const ranked = (barangays || [])
    .map((b) => {
      const s = stats.get(b.id) || { total: 0, approved: 0 };
      const rate = s.total > 0 ? (s.approved / s.total) * 100 : 0;
      return { ...b, total: s.total, approved: s.approved, rate };
    })
    .filter((b) => b.total > 0)
    .sort((a, b) => b.rate - a.rate);

  const rows = ranked.map((b, i) => [
    <span key="rank" className="text-muted-foreground">#{i + 1}</span>,
    <span key="name" className="font-medium">{b.name}</span>,
    <span key="ratio" className="text-muted-foreground">{b.approved} / {b.total}</span>,
    <span key="rate" className="font-semibold text-foreground">{Math.round(b.rate)}%</span>,
  ]);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Barangay Rankings"
        description="Barangays ranked by report approval rate."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Rank" },
              { label: "Barangay" },
              { label: "Approved / Total", align: "right" },
              { label: "Approval Rate", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<Award />}
            emptyMessage="No submission data yet to rank barangays."
          />
        </CardContent>
      </Card>
    </div>
  );
}
