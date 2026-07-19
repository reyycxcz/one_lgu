import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function OnboardingLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.app_metadata?.role || user.user_metadata?.role || "resident";

  if (role !== "resident") {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("barangay_id")
    .eq("id", user.id)
    .single();

  if (profile?.barangay_id) {
    redirect("/resident/dashboard");
  }

  return <>{children}</>;
}
