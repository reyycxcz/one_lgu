import { createClient } from "@/lib/supabase/server";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import BarangayClientLayout from "./client-layout";

const BARANGAY_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { path: "/barangay/dashboard", label: "Dashboard", icon: "Grid" },
    ],
  },
  {
    label: "Documents",
    items: [
      { path: "/barangay/certifications", label: "Certification Requests", icon: "FileSignature" },
      { path: "/barangay/reports", label: "Submit Reports", icon: "FileUp" },
      { path: "/barangay/documents", label: "LGU Documents", icon: "FolderOpen" },
    ],
  },
  {
    label: "Cases",
    items: [
      { path: "/barangay/complaints", label: "Complaint Cases", icon: "Scale" },
    ],
  },
  {
    label: "Administration",
    items: [
      { path: "/barangay/staff", label: "Staff Accounts", icon: "Contact" },
      { path: "/barangay/compliance", label: "Compliance Status", icon: "Activity" },
    ],
  },
];

export default async function BarangayLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, barangays(name)")
    .eq("id", user?.id || "")
    .single();

  const barangayData = profile?.barangays as unknown as { name: string } | null;
  const barangayName = barangayData?.name || "Barangay";

  const userProfile = {
    name: profile?.full_name || user?.user_metadata?.full_name || user?.email || "Barangay Official",
    email: user?.email || "",
    barangayName,
  };

  return (
    <BarangayClientLayout userProfile={userProfile} navGroups={BARANGAY_NAV_GROUPS}>
      {children}
    </BarangayClientLayout>
  );
}
