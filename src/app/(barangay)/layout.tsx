import { ReactNode } from "react";
import { requireRole } from "@/lib/auth/session";
import { BarangayPosition, BarangaySection, POSITION_LABELS, canAccessBarangaySection } from "@/lib/auth/positions";
import BarangayClientLayout from "./client-layout";

const BARANGAY_NAV_GROUPS: {
  label: string;
  items: { path: string; label: string; icon: string; section?: BarangaySection }[];
}[] = [
  {
    label: "Overview",
    items: [
      { path: "/barangay/dashboard", label: "Dashboard", icon: "Grid" },
    ],
  },
  {
    label: "Documents",
    items: [
      { path: "/barangay/certifications", label: "Certification Requests", icon: "FileSignature", section: "certifications" },
      { path: "/barangay/certifications/queue", label: "Certificate Queue", icon: "Package", section: "certifications" },
      { path: "/barangay/reports", label: "Submit Reports", icon: "FileUp", section: "reports" },
      { path: "/barangay/documents", label: "LGU Documents", icon: "FolderOpen", section: "documents" },
    ],
  },
  {
    label: "Cases",
    items: [
      { path: "/barangay/service-reports", label: "Service Reports", icon: "Wrench", section: "service_reports" },
      { path: "/barangay/complaints", label: "Complaint Cases", icon: "Scale", section: "complaints" },
      { path: "/barangay/complaints/docket", label: "Mediation Docket", icon: "CalendarClock", section: "complaints" },
    ],
  },
  {
    label: "Administration",
    items: [
      { path: "/barangay/captain/approvals", label: "Document Approvals", icon: "SealCheck", section: "approvals" },
      { path: "/barangay/staff", label: "Staff Accounts", icon: "Contact", section: "staff" },
      { path: "/barangay/compliance", label: "Compliance Status", icon: "Activity", section: "compliance" },
    ],
  },
];

export default async function BarangayLayout({ children }: { children: ReactNode }) {
  const profile = await requireRole(["barangay_official"]);
  const position = profile.position as BarangayPosition | null;

  const barangayData = profile.barangays as unknown as { name: string } | null;
  const barangayName = barangayData?.name || "Barangay";

  const navGroups = BARANGAY_NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.section || canAccessBarangaySection(position, item.section)),
    }))
    .filter((group) => group.items.length > 0);

  const userProfile = {
    name: profile.full_name || profile.email || "Barangay Official",
    email: profile.email || "",
    barangayName,
    positionLabel: position ? POSITION_LABELS[position] : "Barangay Official",
  };

  return (
    <BarangayClientLayout userProfile={userProfile} navGroups={navGroups}>
      {children}
    </BarangayClientLayout>
  );
}
