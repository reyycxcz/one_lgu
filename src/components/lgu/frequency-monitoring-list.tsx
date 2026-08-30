import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { requireProfile } from "@/lib/auth/session";
import { DEPARTMENT_LABELS, getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import { getFileViewUrl } from "@/lib/storage/file-url";
import { Download } from "lucide-react";
import { FrequencyTabsClient } from "@/components/lgu/frequency-tabs-client";

interface FrequencyMonitoringListProps {
  targetAudience?: "barangay_official" | "sk_official";
}

export async function FrequencyMonitoringList({ targetAudience }: FrequencyMonitoringListProps) {
  const supabase = await createClient();
  const profile = await requireProfile();
  const department = profile.department as LguDepartment | null;

  // Resolve the report types based on the user's department scope
  const reportTypes = getDepartmentReportTypes(department) || [];

  // Fetch all document request actions from audit logs to resolve requesting departments
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("actor_id, metadata")
    .eq("action", "document_request.created");

  const logsList = logs || [];
  const actorIds = Array.from(new Set(logsList.map((l) => l.actor_id).filter(Boolean)));

  let logActors: any[] = [];
  if (actorIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, department")
      .in("id", actorIds);
    logActors = data || [];
  }

  const actorsMap = new Map();
  logActors.forEach((a) => actorsMap.set(a.id, a));

  const titleToDeptMap = new Map();
  logsList.forEach((log) => {
    const title = (log.metadata as any)?.title;
    const actor = actorsMap.get(log.actor_id);
    if (title && actor?.department) {
      titleToDeptMap.set(title, actor.department);
      titleToDeptMap.set(`Document Request: ${title}`, actor.department);
    }
  });

  // Resolve the requested titles for the current department to align standard report filtering
  let requestedTitles: string[] = [];
  if (department) {
    const { data: deptReviewers } = await supabase
      .from("profiles")
      .select("id")
      .eq("department", department);

    const reviewerIds = (deptReviewers || []).map((r) => r.id);

    if (reviewerIds.length > 0) {
      const { data: logs } = await supabase
        .from("audit_logs")
        .select("metadata")
        .eq("action", "document_request.created")
        .in("actor_id", reviewerIds);

      requestedTitles = (logs || [])
        .map((log) => {
          const title = (log.metadata as any)?.title;
          if (!title) return [];
          return [title, `Document Request: ${title}`];
        })
        .flat()
        .filter(Boolean) as string[];
    }
  }

  // Build the OR query filters to select standard types or ad-hoc requests
  const orFilters: string[] = [];
  if (reportTypes.length > 0) {
    orFilters.push(`type.in.(${reportTypes.join(",")})`);
  }
  if (requestedTitles.length > 0) {
    const titleFilterList = requestedTitles.map(t => `"${t.replace(/"/g, '\\"')}"`).join(",");
    orFilters.push(`title.in.(${titleFilterList})`);
  }

  // 1. Fetch standard reports (legacy reports are only Barangay, skip if targetAudience is sk_official)
  const { data: reports } = targetAudience === "sk_official"
    ? { data: [] }
    : await (() => {
        let query = supabase
          .from("reports")
          .select("id, title, type, status, created_at, file_name, file_url, period_end, barangays(name)")
          .order("created_at", { ascending: false });

        if (department) {
          if (orFilters.length > 0) {
            query = query.or(orFilters.join(","));
          } else {
            // Return nothing if department reviewer has no standard report types mapped
            return { data: [] };
          }
        }
        return query;
      })();

  // 2. Fetch new workflow document submissions
  let subQuery = supabase
    .from("document_submissions")
    .select(`
      id,
      request_id,
      file_name,
      file_url,
      status,
      submitted_at,
      barangays (
        name
      ),
      document_requests!inner (
        title,
        requesting_department_id,
        recurrence,
        deadline,
        target_audience
      )
    `)
    .order("submitted_at", { ascending: false });

  if (targetAudience) {
    subQuery = subQuery.in("document_requests.target_audience", [targetAudience, "both"]);
  }

  const { data: dbSubmissions } = await subQuery;

  // Filter submissions by department if reviewer is department-scoped
  const submissions = (dbSubmissions || []).filter((sub: any) => {
    if (!department) return true;
    return sub.document_requests?.requesting_department_id === department;
  });

  // Map legacy reports to rows
  const reportRows = (reports || []).map((d) => {
    const barangay = d.barangays as unknown as { name: string } | null;
    const requestedDept = titleToDeptMap.get(d.title);
    const departmentLabel = requestedDept
      ? (DEPARTMENT_LABELS[requestedDept as keyof typeof DEPARTMENT_LABELS] || requestedDept)
      : null;

    // Determine target year and label from covered period end or creation date
    const reportDate = d.period_end ? new Date(d.period_end) : new Date(d.created_at);
    const rYear = reportDate.getFullYear().toString();
    const rMonth = reportDate.toLocaleDateString("en-US", { month: "long" });

    // Map legacy reports: "other" is one-time, others are monthly recurring
    const recurrence = d.type === "other" ? "one_time" : "monthly";

    let periodLabel = "";
    if (d.type === "other") {
      periodLabel = `One-Time (${rYear})`;
    } else {
      periodLabel = reportDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    return {
      recurrence,
      periodLabel,
      dateStr: d.created_at,
      row: {
        searchText: `${d.file_name || ""} ${d.title} ${barangay?.name || ""} ${departmentLabel || ""} ${periodLabel} ${rYear}`,
        barangay: barangay?.name,
        cells: [
          <a
            key="file"
            href={getFileViewUrl(d.file_url, d.file_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> {d.file_name || "Download"}
          </a>,
          <span key="report" className="text-muted-foreground">{d.title}</span>,
          <span key="period" className="font-semibold text-foreground">{periodLabel}</span>,
          <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
          <span key="department" className="font-semibold text-foreground">
            {departmentLabel ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {departmentLabel}
              </span>
            ) : (
              <span className="text-slate-400 italic text-[11px]">System Scheduled</span>
            )}
          </span>,
          <span key="date" className="text-muted-foreground">
            {new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>,
          <StatusBadge key="status" status={d.status} />,
          <RowActions key="actions" id={d.id} kind="report" status={d.status} />,
        ],
      }
    };
  });

  // Map new workflow submissions to rows
  const submissionRows = submissions.map((sub: any) => {
    const barangay = sub.barangays;
    const request = sub.document_requests;
    const departmentLabel = request?.requesting_department_id
      ? (DEPARTMENT_LABELS[request.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || request.requesting_department_id)
      : "LGU Department";
    const recurrence = request?.recurrence || "one_time";

    const subDate = request?.deadline ? new Date(request.deadline) : new Date(sub.submitted_at);
    const sYear = subDate.getFullYear().toString();
    const sMonth = subDate.toLocaleDateString("en-US", { month: "long" });

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
      recurrence,
      periodLabel,
      dateStr: sub.submitted_at,
      row: {
        searchText: `${sub.file_name || ""} ${request?.title || ""} ${barangay?.name || ""} ${departmentLabel || ""} ${periodLabel} ${sYear}`,
        barangay: barangay?.name,
        cells: [
          <a
            key="file"
            href={getFileViewUrl(sub.file_url, sub.file_name)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> {sub.file_name || "Download"}
          </a>,
          <span key="report" className="text-muted-foreground">{request?.title || "Document Response"}</span>,
          <span key="period" className="font-semibold text-foreground">{periodLabel}</span>,
          <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
          <span key="department" className="font-semibold text-foreground">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {departmentLabel}
            </span>
          </span>,
          <span key="date" className="text-muted-foreground">
            {new Date(sub.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>,
          <StatusBadge key="status" status={sub.status} />,
          <RowActions key="actions" id={sub.id} kind="workflow_submission" status={sub.status} />,
        ],
      }
    };
  });

  const allRows = [...reportRows, ...submissionRows].sort((a, b) => new Date(b.dateStr).getTime() - new Date(a.dateStr).getTime());

  const pageTitle = targetAudience === "sk_official" ? "SK Frequency Monitoring" : "Barangay Frequency Monitoring";

  return (
    <div className="space-y-6">
      <LguPageHeader
        title={pageTitle}
        description="Monitor submitted reports and documents grouped by recurrence or schedule."
      />

      <FrequencyTabsClient initialRows={allRows} />
    </div>
  );
}
