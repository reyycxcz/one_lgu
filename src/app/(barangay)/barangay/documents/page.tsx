import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEPARTMENT_LABELS } from "@/lib/auth/departments";
import { documentRequestTypeLabel } from "@/lib/documents/request-types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { BarangayDocumentsClient } from "@/components/barangay/barangay-documents-client";

// Every document ever requested of this barangay by an LGU department, with
// whatever this barangay has submitted in response (if anything) — the
// definitive archive/register, as opposed to /barangay/reports which only
// surfaces *active* requests still needing a response.
export default async function BarangayDocumentsPage() {
  const profile = await requireBarangaySection("documents");
  const supabase = await createClient();

  const isSk = ["sk_chairman", "sk_secretary", "sk_treasurer"].includes(profile.position || "");

  const { data: rawRequests } = await supabase
    .from("request_recipients")
    .select(`
      request_id,
      document_requests (
        id,
        title,
        deadline,
        status,
        requesting_department_id,
        document_type,
        recurrence,
        target_audience,
        created_at
      )
    `)
    .eq("barangay_id", profile.barangay_id || "");

  const requests = (rawRequests || [])
    .map((r: any) => r.document_requests)
    .filter((req: any) => {
      if (!req) return false;
      if (isSk) {
        return req.target_audience === "sk_official" || req.target_audience === "both";
      } else {
        return req.target_audience === "barangay_official" || req.target_audience === "both";
      }
    })
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const requestIds = requests.map((r: any) => r.id);

  let submissions: any[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("document_submissions")
      .select("id, request_id, status, created_at")
      .in("request_id", requestIds)
      .eq("barangay_id", profile.barangay_id || "");
    submissions = data || [];
  }

  const submissionByRequest = new Map(submissions.map((s) => [s.request_id, s]));

  const NEEDS_ACTION_STATUSES = new Set(["returned", "resubmission_required"]);
  const UNDER_REVIEW_STATUSES = new Set(["pending_captain_approval", "submitted"]);

  let needsAction = 0;
  let underReview = 0;
  let approved = 0;

  const rows = requests.map((req: any) => {
    const sub = submissionByRequest.get(req.id);
    const departmentLabel = req.requesting_department_id
      ? (DEPARTMENT_LABELS[req.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || req.requesting_department_id)
      : "LGU Department";

    const noSubmissionYet = !sub && req.status === "active";
    if (noSubmissionYet || (sub && NEEDS_ACTION_STATUSES.has(sub.status))) needsAction++;
    else if (sub && UNDER_REVIEW_STATUSES.has(sub.status)) underReview++;
    else if (sub && sub.status === "approved") approved++;

    const typeLabel = documentRequestTypeLabel(req.document_type);

    const subDate = req.deadline ? new Date(req.deadline) : new Date(req.created_at);
    const sYear = subDate.getFullYear().toString();
    const sMonth = subDate.toLocaleDateString("en-US", { month: "long" });
    const recurrence = req.recurrence || "one_time";

    let periodLabel = "";
    if (recurrence === "monthly") {
      periodLabel = subDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else if (recurrence === "quarterly") {
      const q = Math.floor(subDate.getMonth() / 3) + 1;
      periodLabel = `Q${q} ${sYear}`;
    } else if (recurrence === "annual") {
      periodLabel = `FY ${sYear}`;
    } else {
      periodLabel = `One-Time (${sYear})`;
    }

    return {
      year: sYear,
      month: sMonth,
      row: {
        searchText: `${req.title} ${departmentLabel} ${typeLabel} ${periodLabel} ${sYear}`,
        cells: [
          <Link key="title" href={`/barangay/documents/${req.id}`} className="font-medium hover:underline">
            {req.title}
          </Link>,
          <span key="type" className="text-[11px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
            {typeLabel}
          </span>,
          <span key="dept" className="text-muted-foreground">{departmentLabel}</span>,
          <span key="period" className="font-semibold text-foreground">{periodLabel}</span>,
          <span key="deadline" className="text-muted-foreground">
            {new Date(req.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>,
          sub ? (
            <StatusBadge key="status" status={sub.status} />
          ) : (
            <span key="status" className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 border border-red-100 text-[10px] font-sans font-bold rounded-full">
              <AlertTriangle className="h-3 w-3 text-red-600" /> Not Submitted
            </span>
          ),
        ],
      }
    };
  });

  const stats = [
    { label: "Total Requests", value: requests.length, icon: FolderOpen },
    { label: "Needs Your Action", value: needsAction, icon: AlertTriangle },
    { label: "Under Review", value: underReview, icon: Clock },
    { label: "Approved", value: approved, icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">LGU Documents</h1>
        <p className="text-sm text-foreground/60 mt-1">Every document ever requested of this barangay by an LGU department, and what's been submitted in response.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border border-border/60 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between p-5 pb-2">
                <CardTitle className="text-[11px] font-bold tracking-wide uppercase text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-primary opacity-80" />
              </CardHeader>
              <CardContent className="p-5 pt-0">
                <p className="text-2xl font-bold text-foreground font-sans tracking-tight">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <BarangayDocumentsClient initialRows={rows} />
    </div>
  );
}
