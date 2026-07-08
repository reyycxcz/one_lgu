import {
  LayoutDashboard,
  FileText,
  AlertOctagon,
  Bell,
  User,
  ClipboardList,
  FolderMinus,
  ShieldAlert,
  Landmark,
  BarChart3,
  Database,
  Users,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const residentNav: NavItem[] = [
  { label: "Dashboard", href: "/resident/dashboard", icon: LayoutDashboard },
  { label: "Certifications", href: "/resident/certifications", icon: FileText },
  { label: "Complaints", href: "/resident/complaints", icon: AlertOctagon },
  { label: "Notifications", href: "/resident/notifications", icon: Bell },
  { label: "My Profile", href: "/resident/profile", icon: User },
];

export const barangayNav: NavItem[] = [
  { label: "Dashboard", href: "/barangay/dashboard", icon: LayoutDashboard },
  { label: "Reports", href: "/barangay/reports", icon: ClipboardList },
  { label: "Documents", href: "/barangay/documents", icon: FolderMinus },
  { label: "Cert Requests", href: "/barangay/certifications", icon: FileText },
  { label: "Complaints", href: "/barangay/complaints", icon: AlertOctagon },
  { label: "Compliance", href: "/barangay/compliance", icon: ShieldAlert },
  { label: "Staff", href: "/barangay/staff", icon: User },
];

export const lguNav: NavItem[] = [
  { label: "Dashboard", href: "/lgu/dashboard", icon: LayoutDashboard },
  { label: "Barangays", href: "/lgu/barangays", icon: Landmark },
  { label: "Review Reports", href: "/lgu/reports", icon: ClipboardList },
  { label: "Compliance", href: "/lgu/compliance", icon: ShieldAlert },
  { label: "Analytics", href: "/lgu/analytics", icon: BarChart3 },
  { label: "Audit Logs", href: "/lgu/audit-logs", icon: Database },
  { label: "Users", href: "/lgu/users", icon: Users },
];
