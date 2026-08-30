import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";

export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { DocumentRequestsCard } from "@/components/barangay/document-requests-card";

export default async function BarangayCompliancePage() {
  const profile = await requireBarangaySection("compliance");
  const supabase = await createClient();

  const { data: rawRequests } = await supabase
    .from("request_recipients")
    .select("request_id")
    .eq("barangay_id", profile.barangay_id || "");

  const requestIds = (rawRequests || []).map((r) => r.request_id);

  let submissions: { status: string }[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("document_submissions")
      .select("status")
      .in("request_id", requestIds)
      .eq("barangay_id", profile.barangay_id || "");
    submissions = data || [];
  }

  const total = requestIds.length;
  const submittedCount = submissions.length;
  const approved = submissions.filter((s) => s.status === "approved").length;
  const rate = submittedCount > 0 ? Math.round((approved / submittedCount) * 100) : 0;
  const needsAction = total - submittedCount + submissions.filter((s) => ["returned", "resubmission_required"].includes(s.status)).length;

  const stats = [
    { label: "Total Documents Requested", value: total, icon: FileText },
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
            <div className="flex-1">
              <h2 className="text-sm font-bold text-foreground">LGU Document Requests</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Full history of every document ever requested of this barangay, and its submission status.</p>
              {needsAction > 0 ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span><span className="font-bold">{needsAction}</span> document{needsAction === 1 ? "" : "s"} need{needsAction === 1 ? "s" : ""} your attention.</span>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>All document requests are up to date!</span>
                </div>
              )}
              <Link href="/barangay/documents" className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-3">
                View Full Document History <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
