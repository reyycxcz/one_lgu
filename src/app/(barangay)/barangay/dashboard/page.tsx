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
import { BarangayServiceToggle } from "@/components/barangay/service-toggle";
import { getBarangayServiceStatus } from "@/actions/barangays";

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
    .select("full_name, role, barangay_id, position, barangays(id, name)")
    .eq("id", session.user.id)
    .single();

  const barangayData = profile?.barangays as unknown as { id: string; name: string } | null;
  const barangayName = barangayData?.name || "";
  const barangayUuid = profile?.barangay_id || barangayData?.id || "";
  const position = (profile?.position as BarangayPosition | null) ?? null;
  const canToggleService = position === "captain" || position === "secretary" || profile?.role === "super_admin";

  const showCertifications = canAccessBarangaySection(position, "certifications");
  const showComplaints = canAccessBarangaySection(position, "complaints");
  const showServiceReports = canAccessBarangaySection(position, "service_reports");
  // Only shown when none of the above apply — the Treasurer's case.
  const showReportsPanel = !showCertifications && !showComplaints && !showServiceReports;
  const isSk = ["sk_chairman", "sk_secretary", "sk_treasurer"].includes(position || "");

  const [
    isServiceOpen,
    certResult,
    complaintResult,
    serviceReportResult,
    reportResult,
    skRequestsResult,
    skSubmissionsResult
  ] = await Promise.all([
    barangayUuid ? getBarangayServiceStatus(barangayUuid) : Promise.resolve(true),
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
    isSk
      ? supabase
          .from("request_recipients")
          .select(`
            request_id,
            document_requests (
              id,
              title,
              deadline,
              status,
              target_audience,
              created_at
            )
          `)
          .eq("barangay_id", barangayUuid || "")
      : Promise.resolve({ data: null }),
    isSk
      ? supabase
          .from("document_submissions")
          .select(`
            id,
            request_id,
            status,
            file_name,
            file_url,
            submitted_at,
            document_requests!inner (
              title,
              target_audience
            )
          `)
          .eq("barangay_id", barangayUuid || "")
          .in("document_requests.target_audience", ["sk_official", "both"])
      : Promise.resolve({ data: null }),
  ]);

  // SK specific calculations
  const skRequestsRaw = skRequestsResult?.data || [];
  const skSubmissions = skSubmissionsResult?.data || [];
  const submissionByRequest = new Map(skSubmissions.map((s) => [s.request_id, s]));

  const skRequests = skRequestsRaw
    .map((r: any) => r.document_requests)
    .filter((req: any) => {
      if (!req || req.status !== "active") return false;
      if (req.hasOwnProperty("target_audience")) {
        return req.target_audience === "sk_official" || req.target_audience === "both";
      }
      return true;
    });

  const activeRequestsCount = skRequests.length;
  const NEEDS_ACTION_STATUSES = new Set(["returned", "resubmission_required"]);
  
  const skNeedsActionCount = skRequests.filter((req: any) => {
    const sub = submissionByRequest.get(req.id);
    return !sub || NEEDS_ACTION_STATUSES.has(sub.status);
  }).length;

  const skUnderReviewCount = skSubmissions.filter((s: any) => 
    ["submitted", "under_review", "pending_captain_approval"].includes(s.status)
  ).length;

  const skApprovedCount = skSubmissions.filter((s: any) => s.status === "approved").length;

  const skPendingRequests = skRequests.filter((req: any) => {
    const sub = submissionByRequest.get(req.id);
    return !sub || NEEDS_ACTION_STATUSES.has(sub.status);
  });

  const skRecentSubmissions = [...skSubmissions]
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 5);

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
    ? `${barangayName ? `${barangayName} — ` : ""}${POSITION_LABELS[position]}`
    : (barangayName ? `${barangayName} — Operations Center` : "Operations Center");

  if (isSk) {
    const quickAction = { href: "/barangay/documents", label: "View LGU Requests" };

    return (
      <div className="space-y-6 animate-stagger-in">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">SK Operations Dashboard</h1>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{subtitle} (Sangguniang Kabataan)</p>
          </div>
          <Button asChild>
            <Link href={quickAction.href}>
              {quickAction.label}
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                Active Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight text-foreground">{activeRequestsCount}</p>
            </CardContent>
          </Card>

          <Card className="bg-primary text-primary-foreground border-0 shadow-sm">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-inherit opacity-90">
                Needs Your Action
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight">{skNeedsActionCount}</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                Under Review
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight text-foreground">{skUnderReviewCount}</p>
            </CardContent>
          </Card>

          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                Approved Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-2xl font-bold font-sans tracking-tight text-foreground">{skApprovedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Required Column */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Action Required (Pending Submissions)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {skPendingRequests.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <p className="text-xs font-semibold text-emerald-600 font-sans">Great Job!</p>
                  <p className="text-[11px] text-muted-foreground mt-1 font-medium">All compliance reports and document requests are up to date.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {skPendingRequests.map((req: any) => {
                    const sub = submissionByRequest.get(req.id);
                    const isReturned = sub && NEEDS_ACTION_STATUSES.has(sub.status);
                    
                    return (
                      <div key={req.id} className="flex items-center justify-between px-6 py-4 text-xs hover:bg-slate-50/30 transition-colors">
                        <div className="space-y-1 pr-4">
                          <p className="font-bold text-foreground line-clamp-1">{req.title}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1.5 font-medium">
                            <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                            {isReturned && (
                              <span className="inline-flex items-center text-rose-600 font-semibold gap-0.5">
                                • Returned: {sub.status.replace(/_/g, " ")}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button size="sm" variant={isReturned ? "destructive" : "default"} asChild className="shrink-0 font-bold text-[10px] px-3">
                          <Link href={`/barangay/documents/${req.id}`}>
                            {isReturned ? "Fix & Resubmit" : "Submit"}
                          </Link>
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Submissions Column */}
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
              <CardTitle className="font-bold text-sm">Recent LGU Submissions</CardTitle>
              <Button variant="link" size="sm" asChild className="text-xs font-bold">
                <Link href="/barangay/documents">View History</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {skRecentSubmissions.length === 0 ? (
                <div className="text-center py-10 px-6">
                  <p className="text-xs text-muted-foreground font-medium">No submissions recorded yet.</p>
                </div>
              ) : (
                // Render the list of recent submissions
                <div className="divide-y divide-border/50">
                  {skRecentSubmissions.map((sub: any) => {
                    const request = sub.document_requests as any;
                    
                    return (
                      <div key={sub.id} className="flex items-center justify-between px-6 py-4 text-xs">
                        <div className="space-y-1 pr-4">
                          <p className="font-bold text-foreground line-clamp-1">{request?.title || "Document Submission"}</p>
                          <p className="text-[10px] text-muted-foreground line-clamp-1 font-medium">
                            File: {sub.file_name} · Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={statusVariant[sub.status] || "secondary"} className="uppercase text-[10px] shrink-0">
                          {sub.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-stagger-in">
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

      {barangayUuid && (
        <BarangayServiceToggle
          barangayId={barangayUuid}
          barangayName={barangayName}
          initialIsOpen={isServiceOpen}
          canToggle={canToggleService}
        />
      )}

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
