import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";

export const dynamic = "force-dynamic";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, FileText, ChevronDown, CheckCircle2, AlertCircle, Download, Eye } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEPARTMENT_LABELS } from "@/lib/auth/departments";
import { requireProfile } from "@/lib/auth/session";
import Link from "next/link";

export default async function ActiveRequestsPage() {
  const profile = await requireProfile();
  const supabase = await createClient();

  // Query document requests with RLS automatically applying rules
  let query = supabase
    .from("document_requests")
    .select(`
      id,
      title,
      description,
      deadline,
      created_at,
      requesting_department_id,
      request_recipients (
        barangay_id,
        barangays (
          id,
          name
        )
      )
    `)
    .order("created_at", { ascending: false });

  if (profile.role !== "super_admin") {
    query = query.eq("requesting_department_id", profile.department || "");
  }

  const { data: requests } = await query;
  const requestsList = requests || [];

  const requestIds = requestsList.map((r) => r.id);
  let submissions: any[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("document_submissions")
      .select("id, request_id, barangay_id, file_name, file_url, status, submitted_at, remarks")
      .in("request_id", requestIds);
    submissions = data || [];
  }

  const submissionsMap = new Map();
  submissions.forEach((sub) => {
    submissionsMap.set(`${sub.request_id}-${sub.barangay_id}`, sub);
  });

  const uniqueRequests = requestsList.map((req) => {
    const targetBarangays = (req.request_recipients || []).map((rec: any) => {
      const b = rec.barangays;
      const subKey = `${req.id}-${rec.barangay_id}`;
      const sub = submissionsMap.get(subKey);
      return {
        id: rec.barangay_id,
        name: b?.name || "Unknown Barangay",
        submitted: !!sub,
        submission: sub || null,
      };
    });

    targetBarangays.sort((a, b) => a.name.localeCompare(b.name));

    const submittedCount = targetBarangays.filter((b) => b.submitted).length;
    const totalCount = targetBarangays.length;

    return {
      ...req,
      targetBarangays,
      submittedCount,
      totalCount,
    };
  });

  return (
    <div className="space-y-6 animate-stagger-in">
      <LguPageHeader
        title="Active Document Requests"
        description="View and track document requests sent to target barangays."
      />

      <div className="space-y-4">
        {uniqueRequests.length === 0 ? (
          <Card className="border border-border/60 shadow-xs">
            <CardContent className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
              <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-semibold">No document requests sent yet</p>
              <p className="text-xs text-muted-foreground mt-1">Dispatched requests will appear here once created.</p>
            </CardContent>
          </Card>
        ) : (
          uniqueRequests.map((req: any, index: number) => {
            const progressPercent = req.totalCount > 0 ? Math.round((req.submittedCount / req.totalCount) * 100) : 0;
            const departmentLabel = req.requesting_department_id
              ? (DEPARTMENT_LABELS[req.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || req.requesting_department_id)
              : null;

            return (
              <Card key={req.id} className="border border-border/60 shadow-xs overflow-hidden">
                <details className="group [&_summary::-webkit-details-marker]:hidden">
                  <summary className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/40 select-none">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                        <h3 className="font-bold text-sm text-foreground">{req.title}</h3>
                        {departmentLabel && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200/60 px-2.5 py-0.5 rounded-full font-semibold shrink-0">
                            {departmentLabel}
                          </span>
                        )}
                      </div>
                      {req.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">{req.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground mt-1">
                        <span>Requested: {new Date(req.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>Deadline: {new Date(req.deadline).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          {req.submittedCount} of {req.totalCount} Barangays Submitted ({progressPercent}%)
                        </span>
                      </div>

                      {/* Simple Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden max-w-md">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-[11px] font-bold text-primary group-open:hidden flex items-center gap-1">
                        Show Status <ChevronDown className="h-4 w-4" />
                      </span>
                      <span className="text-[11px] font-bold text-primary hidden group-open:flex items-center gap-1">
                        Hide Status <ChevronDown className="h-4 w-4 rotate-180" />
                      </span>
                    </div>
                  </summary>

                  <div className="border-t border-border/50 bg-slate-50/30 p-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                      Submission Breakdown
                    </h4>
                    {req.targetBarangays.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No target barangays identified for this request.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {req.targetBarangays.map((b: any, bIdx: number) => (
                          <div
                            key={bIdx}
                            className="p-3.5 rounded-xl border border-border/60 bg-white flex flex-col justify-between gap-3 text-xs shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-foreground truncate">{b.name}</span>
                              {b.submitted ? (
                                <StatusBadge status={b.submission.status} className="scale-90 shadow-2xs" />
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 capitalize">
                                  <AlertCircle className="h-3 w-3 shrink-0" /> Pending
                                </span>
                              )}
                            </div>

                            {b.submitted && b.submission && (
                              <div className="flex items-center justify-between gap-2 mt-1 border-t border-slate-100 pt-2 text-[11px]">
                                <a
                                  href={b.submission.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-primary hover:underline font-bold"
                                >
                                  <Download className="h-3.5 w-3.5 shrink-0" /> Download
                                </a>
                                <Link
                                  href={`/lgu/documents/pending`}
                                  className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                                >
                                  <Eye className="h-3.5 w-3.5 shrink-0" /> View in Inbox
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </details>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
