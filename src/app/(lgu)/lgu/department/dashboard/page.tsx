import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth/session";
import { DEPARTMENT_LABELS, type LguDepartment } from "@/lib/auth/departments";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, CheckCircle, Clock, FileText, Eye, CheckCircle2 } from "lucide-react";
import { RequestDocumentSheet } from "@/components/lgu/request-document-sheet";
import { StatusBadge } from "@/components/shared/status-badge";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  approved: "default",
  returned: "destructive",
  resubmission_required: "destructive",
  submitted: "secondary",
  under_review: "secondary",
};

export default async function DepartmentDashboard() {
  const profile = await requireRole(["lgu_reviewer"]);
  const department = profile.department as LguDepartment | null;

  if (!department) {
    redirect("/lgu/dashboard");
  }

  const supabase = await createClient();

  // 1. Fetch department document requests
  const { data: requests } = await supabase
    .from("document_requests")
    .select("id, title, deadline, status, created_at")
    .eq("requesting_department_id", department)
    .order("created_at", { ascending: false });

  const requestsList = requests || [];
  const requestIds = requestsList.map((r) => r.id);

  // 2. Fetch submissions for these requests
  let submissions: any[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("document_submissions")
      .select(`
        id,
        request_id,
        barangay_id,
        file_name,
        file_url,
        status,
        submitted_at,
        remarks,
        barangays (
          id,
          name
        )
      `)
      .in("request_id", requestIds)
      .order("submitted_at", { ascending: false });
    submissions = data || [];
  }

  // 3. Fetch active barangays
  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const activeBarangays = barangays || [];

  // 4. Calculate metrics
  const pendingReviewSubmissions = submissions.filter((s) =>
    ["submitted", "under_review", "resubmitted"].includes(s.status)
  );
  const pendingCount = pendingReviewSubmissions.length;

  const approvedSubmissions = submissions.filter((s) => s.status === "approved");
  const approvedCount = approvedSubmissions.length;

  // Build submission lookup: key is request_id + "-" + barangay_id
  const submissionsMap = new Map();
  submissions.forEach((sub) => {
    submissionsMap.set(`${sub.request_id}-${sub.barangay_id}`, sub);
  });

  // Calculate compliance rate per barangay
  const activeRequests = requestsList.filter((r) => r.status === "active");
  const activeRequestsCount = activeRequests.length;

  const complianceStats = activeBarangays.map((b) => {
    let completedCount = 0;
    const requestStatuses = activeRequests.map((req) => {
      const sub = submissionsMap.get(`${req.id}-${b.id}`);
      if (sub?.status === "approved") {
        completedCount++;
      }
      return {
        requestTitle: req.title,
        status: sub?.status || "pending",
        submission: sub || null,
      };
    });

    const isFullyCompliant = activeRequestsCount > 0 && completedCount === activeRequestsCount;

    return {
      ...b,
      requestStatuses,
      completedCount,
      isFullyCompliant,
    };
  });

  const compliantCount = complianceStats.filter((c) => c.isFullyCompliant).length;
  const overdueCount = activeBarangays.length - compliantCount;

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-border/60 shadow-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Municipal Department Workspace
          </span>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight mt-2">
            Department: {DEPARTMENT_LABELS[department]}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Manage your department's private document requests, submissions, and reviews.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <RequestDocumentSheet defaultDocumentType="other" allowedTypes={["other"]} />
          <Button asChild variant="outline" size="sm">
            <Link href="/lgu/documents/pending">View Review Inbox</Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-primary text-primary-foreground border-0 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-inherit opacity-90">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 opacity-75" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold font-sans tracking-tight">{pendingCount} Submissions</p>
            <p className="text-[10px] opacity-75 mt-1">Awaiting approval or return action</p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
              Compliant Barangays
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold text-foreground font-sans tracking-tight">
              {compliantCount} / {activeBarangays.length}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">
              Have submitted all required active requests
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border/60 shadow-xs">
          <CardHeader className="p-5 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
              Overdue / Pending
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-2xl font-bold text-foreground font-sans tracking-tight">{overdueCount}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Barangays with incomplete requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Compliance List - Left (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-border/60 shadow-xs">
            <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-bold text-sm">Barangay Compliance Status</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Track document status for each targeted barangay</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {complianceStats.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No active barangays found.</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {complianceStats.map((b) => (
                    <div key={b.id} className="flex flex-col sm:flex-row sm:items-start justify-between px-6 py-5 gap-4 text-xs hover:bg-slate-50/50 transition-colors">
                      <div className="space-y-1 max-w-[200px] w-full">
                        <p className="font-bold text-foreground text-sm">{b.name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          {b.isFullyCompliant ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Fully Compliant
                            </span>
                          ) : (
                            <span>
                              Completed: {b.completedCount} / {activeRequestsCount} requests
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Request specific breakdowns */}
                      <div className="flex-1 space-y-3">
                        {activeRequestsCount === 0 ? (
                          <span className="text-muted-foreground italic text-[11px]">No active requests created</span>
                        ) : (
                          b.requestStatuses.map((reqStatus, rIdx) => (
                            <div key={rIdx} className="flex items-center justify-between gap-4 p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <div className="space-y-0.5">
                                <span className="font-semibold text-foreground line-clamp-1">{reqStatus.requestTitle}</span>
                                {reqStatus.submission && (
                                  <a
                                    href={reqStatus.submission.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
                                  >
                                    <Download className="h-3 w-3" /> {reqStatus.submission.file_name}
                                  </a>
                                )}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {reqStatus.submission ? (
                                  <>
                                    <StatusBadge status={reqStatus.submission.status} className="scale-80" />
                                    <Link
                                      href="/lgu/documents/pending"
                                      className="text-primary hover:underline text-[10px] font-bold"
                                    >
                                      Review
                                    </Link>
                                  </>
                                ) : (
                                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[9px] uppercase font-bold">
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions Feed - Right (1 col) */}
        <div className="space-y-6">
          <Card className="border border-border/60 shadow-xs h-full">
            <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="font-bold text-sm">Recent Submissions</CardTitle>
                <p className="text-[11px] text-muted-foreground mt-0.5">Latest document updates</p>
              </div>
              <Button variant="link" size="sm" asChild className="text-xs font-bold p-0">
                <Link href="/lgu/documents/pending">View All</Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {submissions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center p-6">No submissions received yet.</p>
              ) : (
                <div className="divide-y divide-border/40">
                  {submissions.slice(0, 10).map((sub) => {
                    const brgy = sub.barangays;
                    return (
                      <div key={sub.id} className="p-4 text-xs hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-foreground line-clamp-1">
                            {requestsList.find((r) => r.id === sub.request_id)?.title || "Document Response"}
                          </p>
                          <Badge variant={statusVariant[sub.status] || "secondary"} className="uppercase text-[9px] scale-90 shrink-0">
                            {sub.status.replace(/_/g, " ")}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {brgy?.name || "—"} · {new Date(sub.submitted_at).toLocaleDateString()}
                        </p>
                        <div className="mt-2.5 flex items-center justify-between">
                          <a
                            href={sub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <Download className="h-3 w-3" /> {sub.file_name || "File"}
                          </a>
                          <Link
                            href="/lgu/documents/pending"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-bold"
                          >
                            <Eye className="h-3 w-3" /> Review
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
