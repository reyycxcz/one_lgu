import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { FileText, Download } from "lucide-react";
import { requireProfile } from "@/lib/auth/session";
import { DEPARTMENT_LABELS, type LguDepartment } from "@/lib/auth/departments";

export async function DocumentList({
  title,
  description,
  statuses,
  types,
  submissionStatuses,
}: {
  title: string;
  description: string;
  statuses?: string[];
  types?: string[];
  // document_submissions uses a different status vocabulary than the old
  // reports table ('returned'/'resubmission_required' vs 'rejected', no
  // 'archived' at all) — `statuses` alone can't correctly filter both
  // queries. Defaults to `statuses` when omitted, which is safe for the
  // statuses the two tables do share (submitted/under_review/approved).
  submissionStatuses?: string[];
}) {
  const supabase = await createClient();
  const profile = await requireProfile();
  const department = profile.department as LguDepartment | null;

  // Fetch all document request actions from audit logs to resolve requesting departments (both new and past requests)
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
  if (types && types.length > 0) {
    orFilters.push(`type.in.(${types.join(",")})`);
  }
  if (requestedTitles.length > 0) {
    const titleFilterList = requestedTitles.map(t => `"${t.replace(/"/g, '\\"')}"`).join(",");
    orFilters.push(`title.in.(${titleFilterList})`);
  }

  // `types` distinguishes "no filter" (undefined — an unscoped viewer) from
  // "filter to nothing" ([] — a department with no report type routed to it
  // yet). Only the former should skip the .in("type", ...) filter; treating
  // an empty array as "no filter" would incorrectly show a department-scoped
  // viewer every barangay's documents instead of none.
  const { data: documents } = types && types.length === 0 && requestedTitles.length === 0
    ? { data: [] }
    : await (() => {
        let query = supabase
          .from("reports")
          .select("id, title, file_name, file_url, status, created_at, barangays(name)")
          .order("created_at", { ascending: false })
          .limit(500);

        if (statuses && statuses.length > 0) {
          query = query.in("status", statuses);
        }
        
        // If department-scoped, apply the OR filter of standard types + requested titles
        if (department && orFilters.length > 0) {
          query = query.or(orFilters.join(","));
        } else if (types) {
          // Fallback for unscoped/super_admin where department is null but types is provided
          query = query.in("type", types);
        }

        return query;
      })();

  // Fetch new department workflow submissions from document_submissions.
  // An explicit empty array (as opposed to undefined) means "this category
  // doesn't apply to submissions yet" (e.g. there's no 'archived' concept
  // for them) — skip the query rather than let an empty .in() fall through
  // to "no filter, return everything".
  const subStatuses = submissionStatuses ?? statuses;
  const { data: dbSubmissions } = subStatuses && subStatuses.length === 0
    ? { data: [] }
    : await (() => {
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
            document_requests (
              title,
              requesting_department_id
            )
          `)
          .order("submitted_at", { ascending: false });

        if (subStatuses && subStatuses.length > 0) {
          subQuery = subQuery.in("status", subStatuses);
        }

        return subQuery;
      })();

  const reportRows = (documents || []).map((d) => {
    const barangay = d.barangays as unknown as { name: string } | null;
    const requestedDept = titleToDeptMap.get(d.title);
    const departmentLabel = requestedDept
      ? (DEPARTMENT_LABELS[requestedDept as keyof typeof DEPARTMENT_LABELS] || requestedDept)
      : null;

    return {
      date: new Date(d.created_at),
      row: {
        searchText: `${d.file_name || ""} ${d.title} ${barangay?.name || ""} ${departmentLabel || ""}`,
        barangay: barangay?.name,
        cells: [
          <a
            key="file"
            href={d.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> {d.file_name || "Download"}
          </a>,
          <span key="report" className="text-muted-foreground">{d.title}</span>,
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

  const submissionRows = (dbSubmissions || []).map((sub: any) => {
    const barangay = sub.barangays;
    const request = sub.document_requests;
    const departmentLabel = request?.requesting_department_id
      ? (DEPARTMENT_LABELS[request.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || request.requesting_department_id)
      : "LGU Department";

    return {
      date: new Date(sub.submitted_at),
      row: {
        searchText: `${sub.file_name || ""} ${request?.title || ""} ${barangay?.name || ""} ${departmentLabel || ""}`,
        barangay: barangay?.name,
        cells: [
          <a
            key="file"
            href={sub.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-medium text-xs text-primary hover:underline"
          >
            <Download className="h-3.5 w-3.5" /> {sub.file_name || "Download"}
          </a>,
          <span key="report" className="text-muted-foreground">{request?.title || "Document Response"}</span>,
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

  const rows = [...reportRows, ...submissionRows]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .map(item => item.row);

  return (
    <div className="space-y-6">
      <LguPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "File" },
              { label: "Related Report" },
              { label: "Barangay" },
              { label: "Department" },
              { label: "Date" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<FileText />}
            emptyMessage="No document submissions in this category yet."
            searchPlaceholder="Search file or report..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
