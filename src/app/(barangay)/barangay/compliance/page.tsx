import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, CheckCircle2, AlertTriangle } from "lucide-react";

const REQUIRED_TYPES = ["monthly", "financial", "accomplishment", "compliance"];

export default async function BarangayCompliancePage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("type, status, created_at")
    .eq("barangay_id", profile.barangay_id || "");

  const total = reports?.length || 0;
  const approved = reports?.filter((r) => r.status === "approved").length || 0;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const submittedTypes = new Set((reports || []).map((r) => r.type));
  const missingTypes = REQUIRED_TYPES.filter((t) => !submittedTypes.has(t));

  const stats = [
    { label: "Total Reports Submitted", value: total, icon: FileText },
    { label: "Approved", value: approved, icon: CheckCircle2 },
    { label: "Approval Rate", value: `${rate}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Compliance Status</h1>
        <p className="text-sm text-foreground/60 mt-1">Track monthly submission health and audit compliance targets.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
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
        <CardHeader>
          <CardTitle className="text-sm">Required Report Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {REQUIRED_TYPES.map((type) => {
            const submitted = submittedTypes.has(type);
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm font-medium capitalize text-foreground">{type}</span>
                <Badge variant={submitted ? "default" : "destructive"}>
                  {submitted ? "Submitted" : "Missing"}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {missingTypes.length > 0 && (
        <div className="bryl-card p-4 flex items-center gap-3 bg-red-50 border-red-100">
          <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            Missing {missingTypes.length} required report type{missingTypes.length !== 1 ? "s" : ""}: {missingTypes.join(", ")}
          </p>
        </div>
      )}
    </div>
  );
}
