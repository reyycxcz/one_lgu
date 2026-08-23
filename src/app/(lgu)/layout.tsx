import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getDepartmentReportTypes, type LguDepartment } from "@/lib/auth/departments";
import LGUClientLayout from "./client-layout";

const LGU_NAV_GROUPS = [
  {
    label: "Overview & Monitoring",
    items: [
      { path: "/lgu/dashboard", label: "Overview", icon: "LayoutDashboard" },
      { path: "/lgu/compliance/status", label: "Compliance Matrix", icon: "ClipboardList" },
      { path: "/lgu/compliance/late", label: "Overdue & Missing", icon: "AlertCircle" },
      { path: "/lgu/dashboard/recent-activities", label: "Activity Stream", icon: "Activity" },
    ],
  },
  {
    label: "Document Requester",
    items: [
      { path: "/lgu/requests/new", label: "Create Request", icon: "Plus" },
      { path: "/lgu/requests/active", label: "Active Requests", icon: "FileText" },
      { path: "/lgu/settings/document-types", label: "Requirement Templates", icon: "FolderOpen" },
    ],
  },
  {
    label: "Document Receiver",
    items: [
      { path: "/lgu/documents/pending", label: "Review Inbox", icon: "Upload" },
      { path: "/lgu/documents/approved", label: "Approved Registry", icon: "CheckCircle" },
      { path: "/lgu/documents/returned", label: "Returned & Action Needed", icon: "XCircle" },
      { path: "/lgu/documents/archived", label: "Archived Records", icon: "Archive" },
    ],
  },
  {
    label: "Barangay Directory & Performance",
    items: [
      { path: "/lgu/barangays/profiles", label: "Barangay Profiles", icon: "Building2" },
      { path: "/lgu/barangays/officials", label: "Barangay Officials", icon: "Users" },
      { path: "/lgu/compliance/rankings", label: "Compliance Rankings", icon: "Award" },
    ],
  },
  {
    label: "Public Services",
    items: [
      { path: "/lgu/certifications/all", label: "Certifications", icon: "ListChecks" },
      { path: "/lgu/complaints/all", label: "Complaints Console", icon: "AlertTriangle" },
    ],
  },
  {
    label: "Communications",
    items: [
      { path: "/lgu/announcements/create", label: "Send Broadcast", icon: "Megaphone" },
      { path: "/lgu/announcements/sent", label: "Broadcast History", icon: "Bell" },
    ],
  },
  {
    label: "System & User Management",
    items: [
      { path: "/lgu/users/departments", label: "Staff & Reviewers", icon: "UserCheck" },
      { path: "/lgu/settings/system", label: "System Settings", icon: "Settings" },
      { path: "/lgu/audit-logs/activities", label: "Audit Logs", icon: "Database" },
    ],
  },
  {
    label: "Profile",
    items: [
      { path: "/lgu/profile", label: "My Profile", icon: "UserCircle" },
      { path: "/lgu/profile/password", label: "Change Password", icon: "Lock" },
      { path: "/login", label: "Logout", icon: "LogOut" },
    ],
  },
];

export default async function LGULayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["lgu_reviewer"]);
  const department = profile.department as LguDepartment | null;
  const departmentReportTypes = getDepartmentReportTypes(department);

  const userProfile = {
    name: profile.full_name || profile.email || "Super Admin",
    email: profile.email || "",
    role: profile.role as "super_admin" | "lgu_reviewer",
    department,
  };

  // Pending items awaiting LGU action, for the header approvals indicator.
  // A department-scoped reviewer only ever handles reports of their own
  // type(s) — certifications/complaints aren't theirs to act on, so those
  // stay at 0 rather than showing municipality-wide counts that don't apply.
  const supabase = await createClient();

  // Fetch requested titles for department reviewers to align header count indicators
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
  if (departmentReportTypes && departmentReportTypes.length > 0) {
    orFilters.push(`type.in.(${departmentReportTypes.join(",")})`);
  }
  if (requestedTitles.length > 0) {
    const titleFilterList = requestedTitles.map(t => `"${t.replace(/"/g, '\\"')}"`).join(",");
    orFilters.push(`title.in.(${titleFilterList})`);
  }

  let reportsQuery = supabase.from("reports").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review"]);
  
  if (department) {
    if (orFilters.length > 0) {
      reportsQuery = reportsQuery.or(orFilters.join(","));
    } else {
      reportsQuery = reportsQuery.eq("id", "00000000-0000-0000-0000-000000000000");
    }
  }

  const [certs, reports, complaints, customSub] = await Promise.all([
    departmentReportTypes
      ? Promise.resolve({ count: 0 })
      : supabase.from("certification_requests").select("id", { count: "exact", head: true }).in("status", ["submitted", "verified"]),
    reportsQuery,
    departmentReportTypes
      ? Promise.resolve({ count: 0 })
      : supabase.from("complaints").select("id", { count: "exact", head: true }).eq("status", "submitted"),
    supabase.from("document_submissions").select("id", { count: "exact", head: true }).in("status", ["submitted", "under_review", "resubmitted"]),
  ]);

  const pending = {
    certifications: certs.count || 0,
    reports: (reports.count || 0) + (customSub.count || 0),
    complaints: complaints.count || 0,
  };

  return (
    <LGUClientLayout userProfile={userProfile} navGroups={LGU_NAV_GROUPS} pending={pending}>
      {children}
    </LGUClientLayout>
  );
}