import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LguEmptyState } from "@/components/lgu/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

export default async function ComplianceOverviewPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: reports }] = await Promise.all([
    supabase.from("barangays").select("id, name").eq("is_active", true).order("name"),
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

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Compliance Overview"
        description="Report submission and approval compliance rate per barangay."
      />
      <Card>
        <CardContent className="p-0">
          {!barangays || barangays.length === 0 ? (
            <LguEmptyState icon={<TrendingUp />} message="No barangays registered yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Barangay</TableHead>
                  <TableHead className="text-right">Reports Submitted</TableHead>
                  <TableHead className="text-right">Approval Rate</TableHead>
                  <TableHead className="text-right">Standing</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangays.map((b) => {
                  const s = stats.get(b.id);
                  const rate = s && s.total > 0 ? Math.round((s.approved / s.total) * 100) : null;
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-medium">{b.name}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{s?.total || 0}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{rate !== null ? `${rate}%` : "—"}</TableCell>
                      <TableCell className="text-right">
                        {s && s.total > 0 ? (
                          <Badge variant={rate! >= 80 ? "default" : rate! >= 50 ? "secondary" : "destructive"}>
                            {rate! >= 80 ? "Good" : rate! >= 50 ? "Fair" : "Needs Attention"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">No Data</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
