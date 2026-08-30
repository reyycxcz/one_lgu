import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarangayFormSheet } from "@/components/lgu/barangay-form-sheet";

function Breakdown({ title, data, total, colors }: { title: string; data: Record<string, number>; total: number; colors: Record<string, string> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-xs text-muted-foreground">No records yet.</p>
        ) : (
          entries.map(([status, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={status}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="capitalize text-foreground/70">{status.replace(/_/g, " ")}</span>
                  <span className="font-semibold tabular-nums">{count} <span className="text-foreground/40">· {pct}%</span></span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div className={`h-full rounded-full ${colors[status] || "bg-slate-300"}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default async function LguBarangayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: barangay } = await supabase
    .from("barangays")
    .select("*")
    .eq("id", id)
    .single();

  if (!barangay) notFound();

  const [
    { count: officialsCount },
    { count: residentsCount },
    { data: reportRows },
    { data: certRows },
    { data: complaintRows },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("barangay_id", id).eq("role", "barangay_official"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("barangay_id", id).eq("role", "resident"),
    supabase.from("reports").select("status").eq("barangay_id", id),
    supabase.from("certification_requests").select("status").eq("barangay_id", id),
    supabase.from("complaints").select("status").eq("barangay_id", id),
  ]);

  function tally(rows: { status: string }[] | null) {
    const map: Record<string, number> = {};
    for (const r of rows || []) map[r.status] = (map[r.status] || 0) + 1;
    return map;
  }
  const certByStatus = tally(certRows);
  const complaintByStatus = tally(complaintRows);
  const reportByStatus = tally(reportRows);

  const reportsCount = reportRows?.length || 0;
  const certsCount = certRows?.length || 0;
  const complaintsCount = complaintRows?.length || 0;

  // Compliance rate = approved reports / total reports.
  const approvedReports = reportByStatus["approved"] || 0;
  const complianceRate = reportsCount > 0 ? Math.round((approvedReports / reportsCount) * 100) : 0;

  const stats = [
    { label: "Officials", value: officialsCount || 0 },
    { label: "Residents", value: residentsCount || 0 },
    { label: "Reports", value: reportsCount },
    { label: "Certifications", value: certsCount },
    { label: "Complaints", value: complaintsCount },
  ];

  const CERT_STATUS_COLORS: Record<string, string> = {
    submitted: "bg-amber-500", verified: "bg-primary", approved: "bg-primary",
    released: "bg-primary", rejected: "bg-red-500", generated: "bg-slate-400", ready_for_pickup: "bg-primary",
  };
  const COMPLAINT_STATUS_COLORS: Record<string, string> = {
    submitted: "bg-amber-500", under_review: "bg-amber-500", scheduled: "bg-amber-500",
    mediation: "bg-amber-500", resolved: "bg-primary", closed: "bg-slate-400",
  };
  const REPORT_STATUS_COLORS: Record<string, string> = {
    submitted: "bg-amber-500", under_review: "bg-amber-500", approved: "bg-primary",
    rejected: "bg-red-500", archived: "bg-slate-400",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/lgu/barangays" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </Link>
          <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">{barangay.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{barangay.municipality}, {barangay.province} · {barangay.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={barangay.is_active ? "default" : "outline"}>
            {barangay.is_active ? "Active" : "Inactive"}
          </Badge>
          <BarangayFormSheet
            mode="edit"
            barangay={barangay}
            trigger={
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-secondary text-primary hover:bg-secondary/70 transition-colors">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </span>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report compliance rate */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold">Report Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between mb-2">
            <span className="text-3xl font-bold text-foreground">{complianceRate}%</span>
            <span className="text-xs text-muted-foreground">{approvedReports} of {reportsCount} reports approved</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary" style={{ width: `${complianceRate}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* Per-barangay drill-down breakdowns */}
      <div className="grid gap-4 md:grid-cols-3">
        <Breakdown title="Certifications by Status" data={certByStatus} total={certsCount} colors={CERT_STATUS_COLORS} />
        <Breakdown title="Complaints by Status" data={complaintByStatus} total={complaintsCount} colors={COMPLAINT_STATUS_COLORS} />
        <Breakdown title="Reports by Status" data={reportByStatus} total={reportsCount} colors={REPORT_STATUS_COLORS} />
      </div>
    </div>
  );
}
