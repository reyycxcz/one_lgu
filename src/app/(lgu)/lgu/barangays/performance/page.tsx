import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { BarChart3 } from "lucide-react";

export default async function PerformanceMonitoringPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: reports }, { data: certs }, { data: complaints }] = await Promise.all([
    supabase.from("barangays").select("id, name, municipality").order("name"),
    supabase.from("reports").select("barangay_id, status"),
    supabase.from("certification_requests").select("barangay_id, status"),
    supabase.from("complaints").select("barangay_id, status"),
  ]);

  type Stats = { reportsTotal: number; reportsApproved: number; certsTotal: number; certsReleased: number; complaintsTotal: number; complaintsResolved: number };
  const stats = new Map<string, Stats>();
  const ensure = (id: string) => {
    if (!stats.has(id)) stats.set(id, { reportsTotal: 0, reportsApproved: 0, certsTotal: 0, certsReleased: 0, complaintsTotal: 0, complaintsResolved: 0 });
    return stats.get(id)!;
  };
  (reports || []).forEach((r) => {
    if (!r.barangay_id) return;
    const s = ensure(r.barangay_id);
    s.reportsTotal++;
    if (r.status === "approved") s.reportsApproved++;
  });
  (certs || []).forEach((c) => {
    if (!c.barangay_id) return;
    const s = ensure(c.barangay_id);
    s.certsTotal++;
    if (c.status === "released") s.certsReleased++;
  });
  (complaints || []).forEach((c) => {
    if (!c.barangay_id) return;
    const s = ensure(c.barangay_id);
    s.complaintsTotal++;
    if (c.status === "resolved" || c.status === "closed") s.complaintsResolved++;
  });

  const rows = (barangays || []).map((b) => {
    const s = stats.get(b.id);
    return [
      <span key="name" className="font-medium">{b.name}</span>,
      <span key="reports" className="text-muted-foreground">{s ? `${s.reportsApproved} / ${s.reportsTotal}` : "0 / 0"}</span>,
      <span key="certs" className="text-muted-foreground">{s ? `${s.certsReleased} / ${s.certsTotal}` : "0 / 0"}</span>,
      <span key="complaints" className="text-muted-foreground">{s ? `${s.complaintsResolved} / ${s.complaintsTotal}` : "0 / 0"}</span>,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Performance Monitoring"
        description="Report compliance and processing completion rates per barangay."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Barangay" },
              { label: "Reports Approved", align: "right" },
              { label: "Certificates Released", align: "right" },
              { label: "Complaints Resolved", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<BarChart3 />}
            emptyMessage="No barangay activity to monitor yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
