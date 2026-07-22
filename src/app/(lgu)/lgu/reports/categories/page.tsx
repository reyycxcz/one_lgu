import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LguEmptyState } from "@/components/lgu/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FolderOpen } from "lucide-react";

const REPORT_TYPES = ["monthly", "financial", "accomplishment", "compliance"] as const;

export default async function ReportCategoriesPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase.from("reports").select("type, status");

  const counts = new Map<string, { total: number; approved: number; pending: number }>();
  REPORT_TYPES.forEach((t) => counts.set(t, { total: 0, approved: 0, pending: 0 }));
  (reports || []).forEach((r) => {
    const entry = counts.get(r.type) || { total: 0, approved: 0, pending: 0 };
    entry.total++;
    if (r.status === "approved") entry.approved++;
    if (r.status === "submitted" || r.status === "under_review") entry.pending++;
    counts.set(r.type, entry);
  });

  const hasAny = (reports || []).length > 0;

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Report Categories"
        description="Submission volume broken down by report category."
      />
      <Card>
        <CardContent className="p-0">
          {!hasAny ? (
            <LguEmptyState icon={<FolderOpen />} message="No reports submitted yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Submitted</TableHead>
                  <TableHead className="text-right">Pending Review</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REPORT_TYPES.map((type) => {
                  const c = counts.get(type)!;
                  return (
                    <TableRow key={type}>
                      <TableCell className="font-medium capitalize">{type}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{c.total}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{c.pending}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{c.approved}</TableCell>
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
