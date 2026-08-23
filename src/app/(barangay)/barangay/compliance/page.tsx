import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { DocumentRequestsCard } from "@/components/barangay/document-requests-card";

const REQUIRED_TYPES = ["monthly", "financial", "accomplishment", "compliance"];

export default async function BarangayCompliancePage() {
  const profile = await requireBarangaySection("compliance");
  const supabase = await createClient();

  const { data } = await supabase
    .from("reports")
    .select("type, status, title, file_url, created_at")
    .eq("barangay_id", profile.barangay_id || "");

  const reports = data || [];
  const total = reports.length;
  const approved = reports.filter((r) => r.status === "approved").length;
  const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

  const submittedTypes = new Set(reports.map((r) => r.type));
  const missingTypes = REQUIRED_TYPES.filter((t) => !submittedTypes.has(t));

  const stats = [
    { label: "Total Reports Submitted", value: total, icon: FileText },
    { label: "Approved", value: approved, icon: CheckCircle2 },
    { label: "Approval Rate", value: `${rate}%`, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6 animate-stagger-in">
      <div className="bg-white p-6 rounded-xl border border-border/60 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
          Barangay Portal
        </span>
        <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight mt-2">
          Compliance Dashboard
        </h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">
          Monitor required document uploads and review requests from LGU departments.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary opacity-80" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-bold text-foreground font-sans tracking-tight">
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <DocumentRequestsCard barangayId={profile.barangay_id} />

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700 h-fit">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Periodic Submissions Checklist</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Mandatory reports that must be submitted regularly.</p>
              {missingTypes.length > 0 ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Missing periodic reports for this cycle: <span className="font-bold capitalize">{missingTypes.join(", ")}</span></span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>All periodic reports are up to date!</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
