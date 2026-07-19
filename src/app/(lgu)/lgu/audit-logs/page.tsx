import { Card, CardContent } from "@/components/ui/card";

export default function LguAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">System-wide logs recording state modifications, actors, IP addresses, and timestamps.</p>
      </div>
      <Card>
        <CardContent className="py-16 flex items-center justify-center text-center">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">Audit logs data table loaded from Supabase</p>
        </CardContent>
      </Card>
    </div>
  );
}

