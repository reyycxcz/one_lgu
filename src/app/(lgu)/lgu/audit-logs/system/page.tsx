import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LguEmptyState } from "@/components/lgu/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Database } from "lucide-react";

export default async function SystemLogsPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, created_at")
    .is("actor_id", null)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="System Logs"
        description="Automated, system-triggered events with no associated user actor."
      />
      <Card>
        <CardContent className="p-0">
          {!logs || logs.length === 0 ? (
            <LguEmptyState icon={<Database />} message="No system-triggered events recorded yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                    <TableCell className="text-muted-foreground capitalize">{l.entity_type.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(l.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
