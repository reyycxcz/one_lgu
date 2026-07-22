import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, FileText, Database } from "lucide-react";

export default async function SystemSettingsPage() {
  const supabase = await createClient();

  const [
    { count: barangaysCount },
    { count: profilesCount },
    { count: certsCount },
    { count: complaintsCount },
    { count: reportsCount },
    { count: auditLogsCount },
  ] = await Promise.all([
    supabase.from("barangays").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("certification_requests").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }),
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("audit_logs").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Registered Users", value: profilesCount || 0, icon: Users },
    { label: "Barangays", value: barangaysCount || 0, icon: Building2 },
    { label: "Total Records (Certs + Reports + Complaints)", value: (certsCount || 0) + (reportsCount || 0) + (complaintsCount || 0), icon: FileText },
    { label: "Audit Log Entries", value: auditLogsCount || 0, icon: Database },
  ];

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="System Settings"
        description="Live system statistics and environment information."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform</span>
            <span className="font-medium text-foreground">OneLGU — Municipality of Dingras, Ilocos Norte</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Database</span>
            <span className="font-medium text-foreground">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Framework</span>
            <span className="font-medium text-foreground">Next.js</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
