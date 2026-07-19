import { createClient } from "@/lib/supabase/server";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import LGUClientLayout from "./client-layout";

const LGU_NAV_GROUPS = [
  {
    label: "Dashboard",
    items: [
      { path: "/lgu/dashboard", label: "Overview", icon: "LayoutDashboard" },
      { path: "/lgu/dashboard/submission-summary", label: "Submission Summary", icon: "FileText" },
      { path: "/lgu/dashboard/pending-approvals", label: "Pending Approvals", icon: "ClipboardCheck" },
      { path: "/lgu/dashboard/compliance-overview", label: "Compliance Overview", icon: "TrendingUp" },
      { path: "/lgu/dashboard/recent-activities", label: "Recent Activities", icon: "Activity" },
    ],
  },
  {
    label: "Barangays",
    items: [
      { path: "/lgu/barangays", label: "Barangay List", icon: "Building2" },
      { path: "/lgu/barangays/profiles", label: "Barangay Profiles", icon: "FileText" },
      { path: "/lgu/barangays/officials", label: "Assigned Officials", icon: "Users" },
      { path: "/lgu/barangays/performance", label: "Performance Monitoring", icon: "BarChart3" },
    ],
  },
  {
    label: "Barangay Reports",
    items: [
      { path: "/lgu/reports/pending", label: "Pending Reports", icon: "Clock" },
      { path: "/lgu/reports/approved", label: "Approved Reports", icon: "CheckCircle" },
      { path: "/lgu/reports/returned", label: "Returned Reports", icon: "XCircle" },
      { path: "/lgu/reports/archived", label: "Archived Reports", icon: "Archive" },
      { path: "/lgu/reports/categories", label: "Report Categories", icon: "FolderOpen" },
    ],
  },
  {
    label: "Document Submissions",
    items: [
      { path: "/lgu/documents/pending", label: "Pending Documents", icon: "Upload" },
      { path: "/lgu/documents/approved", label: "Approved Documents", icon: "CheckCircle" },
      { path: "/lgu/documents/returned", label: "Returned Documents", icon: "XCircle" },
      { path: "/lgu/documents/archived", label: "Archived Documents", icon: "Archive" },
    ],
  },
  {
    label: "Certification Requests",
    items: [
      { path: "/lgu/certifications/all", label: "All Requests", icon: "ListChecks" },
      { path: "/lgu/certifications/pending", label: "Pending", icon: "Clock" },
      { path: "/lgu/certifications/approved", label: "Approved", icon: "CheckCircle" },
      { path: "/lgu/certifications/rejected", label: "Rejected", icon: "XCircle" },
      { path: "/lgu/certifications/issued", label: "Issued Certificates", icon: "Award" },
    ],
  },
  {
    label: "Complaint Reports",
    items: [
      { path: "/lgu/complaints/all", label: "All Complaints", icon: "AlertTriangle" },
      { path: "/lgu/complaints/pending", label: "Pending Cases", icon: "Clock" },
      { path: "/lgu/complaints/investigation", label: "Under Investigation", icon: "Search" },
      { path: "/lgu/complaints/resolved", label: "Resolved Cases", icon: "CheckCircle" },
      { path: "/lgu/complaints/closed", label: "Closed Cases", icon: "Archive" },
    ],
  },
  {
    label: "Compliance Monitoring",
    items: [
      { path: "/lgu/compliance/status", label: "Submission Status", icon: "ClipboardList" },
      { path: "/lgu/compliance/late", label: "Late Submissions", icon: "AlertCircle" },
      { path: "/lgu/compliance/missing", label: "Missing Requirements", icon: "AlertTriangle" },
      { path: "/lgu/compliance/rankings", label: "Barangay Rankings", icon: "Award" },
      { path: "/lgu/compliance/history", label: "Compliance History", icon: "History" },
    ],
  },
  {
    label: "Analytics",
    items: [
      { path: "/lgu/analytics/submissions", label: "Submission Analytics", icon: "BarChart3" },
      { path: "/lgu/analytics/complaints", label: "Complaint Analytics", icon: "PieChart" },
      { path: "/lgu/analytics/certifications", label: "Certification Analytics", icon: "FileBarChart" },
      { path: "/lgu/analytics/compliance", label: "Compliance Analytics", icon: "TrendingUp" },
      { path: "/lgu/analytics/annual", label: "Annual Reports", icon: "FileSpreadsheet" },
    ],
  },
  {
    label: "Announcements",
    items: [
      { path: "/lgu/announcements/create", label: "Create Announcement", icon: "Plus" },
      { path: "/lgu/announcements/sent", label: "Sent Announcements", icon: "Megaphone" },
      { path: "/lgu/announcements/history", label: "Notification History", icon: "Bell" },
    ],
  },
  {
    label: "User Management",
    items: [
      { path: "/lgu/users/residents", label: "Residents", icon: "Users" },
      { path: "/lgu/users/officials", label: "Barangay Officials", icon: "UserCheck" },
      { path: "/lgu/users/sk-officials", label: "SK Officials", icon: "UserPlus" },
      { path: "/lgu/users/requests", label: "Account Requests", icon: "UserCog" },
    ],
  },
  {
    label: "System Management",
    items: [
      { path: "/lgu/settings/document-types", label: "Document Types", icon: "FileText" },
      { path: "/lgu/settings/report-categories", label: "Report Categories", icon: "FolderOpen" },
      { path: "/lgu/settings/certification-types", label: "Certification Types", icon: "Award" },
      { path: "/lgu/settings/complaint-categories", label: "Complaint Categories", icon: "AlertTriangle" },
      { path: "/lgu/settings/barangays", label: "Barangay Management", icon: "Building2" },
      { path: "/lgu/settings/system", label: "System Settings", icon: "Settings" },
    ],
  },
  {
    label: "Audit Logs",
    items: [
      { path: "/lgu/audit-logs/activities", label: "User Activities", icon: "Activity" },
      { path: "/lgu/audit-logs/login-history", label: "Login History", icon: "History" },
      { path: "/lgu/audit-logs/system", label: "System Logs", icon: "Database" },
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
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const userProfile = {
    name: user?.user_metadata?.full_name || user?.email || "Super Admin",
    email: user?.email || "",
  };

  return (
    <LGUClientLayout userProfile={userProfile} navGroups={LGU_NAV_GROUPS}>
      {children}
    </LGUClientLayout>
  );
}