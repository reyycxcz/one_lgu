import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { LguEmptyState } from "@/components/lgu/empty-state";
import { AuditExportButton } from "@/components/lgu/audit-export-button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

export default async function UserActivitiesPage() {
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, created_at, profiles!audit_logs_actor_id_fkey(full_name), barangays(name)")
    .not("actor_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="User Activities"
        description="Full audit trail of actions taken by users across the system."
        action={<AuditExportButton />}
      />
      <Card>
        <CardContent className="p-0">
          {!logs || logs.length === 0 ? (
            <LguEmptyState icon={<Activity />} message="No user activity recorded yet." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Barangay</TableHead>
                  <TableHead className="text-right">Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((l) => {
                  const actor = l.profiles as unknown as { full_name: string } | null;
                  const barangay = l.barangays as unknown as { name: string } | null;
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{actor?.full_name || "—"}</TableCell>
                      <TableCell><Badge variant="outline">{l.action}</Badge></TableCell>
                      <TableCell className="text-muted-foreground capitalize">{l.entity_type.replace(/_/g, " ")}</TableCell>
                      <TableCell className="text-muted-foreground">{barangay?.name || "—"}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(l.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
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
