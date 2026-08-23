import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { canAccessBarangaySection, POSITION_LABELS, type BarangayPosition } from "@/lib/auth/positions";
import { complaintTypeLabel } from "@/lib/complaints/taxonomy";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REPORT_TYPE_LABELS } from "@/types/report";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  rejected: "destructive",
  submitted: "secondary",
  verified: "secondary",
  resolved: "default",
  settled: "default",
  closed: "default",
  mediation: "secondary",
};

export default async function BarangayDashboard() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, barangay_id, position, barangays(name)")
    .eq("id", session.user.id)
    .single();

  const barangayData = profile?.barangays as unknown as { name: string } | null;
  const barangayId = barangayData?.name || "";
  const barangayUuid = profile?.barangay_id;
  const position = (profile?.position as BarangayPosition | null) ?? null;

  const showCertifications = canAccessBarangaySection(position, "certifications");
  const showComplaints = canAccessBarangaySection(position, "complaints");
  const showServiceReports = canAccessBarangaySection(position, "service_reports");
  // Only shown when none of the above apply — the Treasurer's case.
  const showReportsPanel = !showCertifications && !showComplaints && !showServiceReports;

  const [certResult, complaintResult, serviceReportResult, reportResult] = await Promise.all([
    showCertifications
      ? supabase
          .from("certification_requests")
          .select("id, status, type, purpose, created_at, requester:profiles(full_name)")
          .eq("barangay_id", barangayUuid || "")
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null }),
    showComplaints
      ? supabase
          .from("complaints")
          .select("id, status, subject, created_at")
          .eq("barangay_id", barangayUuid || "")
          .eq("record_type", "formal_complaint")
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null }),
    showServiceReports
      ? supabase
          .from("complaints")
          .select("id, status, subject, type, created_at")
          .eq("barangay_id", barangayUuid || "")
          .eq("record_type", "service_report")
          .order("created_at", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: null }),
    supabase
      .from("reports")
      .select("id, status, title, type, created_at")
      .eq("barangay_id", barangayUuid || "")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const pendingCerts = certResult.data?.filter(c => c.status === "submitted" || c.status === "verified").length || 0;
  const activeComplaints = complaintResult.data?.filter(c => !["settled", "not_settled", "closed"].includes(c.status)).length || 0;
  const activeServiceReports = serviceReportResult.data?.filter(r => !["resolved", "closed", "rejected"].includes(r.status)).length || 0;
  const totalReports = reportResult.data?.length || 0;

  const quickAction = showCertifications
    ? { href: "/barangay/certifications", label: "Process Requests" }
    : showServiceReports
      ? { href: "/barangay/service-reports", label: "View Community Reports" }
      : { href: "/barangay/reports", label: "View Reports" };

  const subtitle = position
    ? `${barangayId ? `${barangayId} — ` : ""}${POSITION_LABELS[position]}`
    : (barangayId ? `${barangayId} — Operations Center` : "Operations Center");

  return (
    <div className="space-y-8 animate-stagger-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Barangay Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle}</p>
        </div>
        <Button asChild>
          <Link href={quickAction.href}>
            <Plus /> {quickAction.label}
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {showCertifications && (
          <Card className="bg-primary text-primary-foreground border-0 shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-inherit opacity-90">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight">{pendingCerts} Requests</p>
            </CardContent>
          </Card>
        )}

        {showServiceReports && (
          <Card>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                Active Community Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight">{activeServiceReports}</p>
            </CardContent>
          </Card>
        )}

        {showComplaints && (
          <Card>
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                Active Formal Complaints
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight">{activeComplaints}</p>
            </CardContent>
          </Card>
        )}

        <Card className={!showCertifications ? "bg-primary text-primary-foreground border-0 shadow-sm" : undefined}>
          <CardHeader className="p-5 pb-2">
            <CardTitle className={`text-[11px] font-bold tracking-wide uppercase ${!showCertifications ? "text-inherit opacity-90" : "text-muted-foreground"}`}>
              Reports Submitted
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold font-sans tracking-tight">{totalReports}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {showCertifications && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Recent Certifications</CardTitle>
              <Button variant="link" size="sm" asChild className="text-xs font-bold">
                <Link href="/barangay/certifications">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!certResult.data || certResult.data.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No certification requests yet.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {certResult.data.map((cert) => (
                    <div key={cert.id} className="flex items-center justify-between px-6 py-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{cert.type.replace(/_/g, " ")}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{cert.purpose}</p>
                      </div>
                      <Badge variant={statusVariant[cert.status] || "secondary"} className="uppercase text-[10px]">
                        {cert.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showServiceReports && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Recent Community Reports</CardTitle>
              <Button variant="link" size="sm" asChild className="text-xs font-bold">
                <Link href="/barangay/service-reports">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!serviceReportResult.data || serviceReportResult.data.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No community reports yet.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {serviceReportResult.data.map((r) => (
                    <div key={r.id} className="flex items-center justify-between px-6 py-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{r.subject}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{complaintTypeLabel(r.type)}</p>
                      </div>
                      <Badge variant={statusVariant[r.status] || "secondary"} className="uppercase text-[10px]">
                        {r.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showComplaints && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Recent Formal Complaints</CardTitle>
              <Button variant="link" size="sm" asChild className="text-xs font-bold">
                <Link href="/barangay/complaints">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!complaintResult.data || complaintResult.data.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No formal complaints yet.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {complaintResult.data.map((complaint) => (
                    <div key={complaint.id} className="flex items-center justify-between px-6 py-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{complaint.subject}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(complaint.created_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={statusVariant[complaint.status] || "secondary"} className="uppercase text-[10px]">
                        {complaint.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showReportsPanel && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Recent Reports</CardTitle>
              <Button variant="link" size="sm" asChild className="text-xs font-bold">
                <Link href="/barangay/reports">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {!reportResult.data || reportResult.data.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No reports submitted yet.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {reportResult.data.map((report) => (
                    <div key={report.id} className="flex items-center justify-between px-6 py-3 text-xs">
                      <div>
                        <p className="font-bold text-foreground">{report.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {REPORT_TYPE_LABELS[report.type as keyof typeof REPORT_TYPE_LABELS] || report.type} · {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={statusVariant[report.status] || "secondary"} className="uppercase text-[10px]">
                        {report.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
