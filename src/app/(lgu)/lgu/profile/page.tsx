import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MfaStatusCard } from "@/components/mfa-status-card";
import LguProfileForm from "./profile-form";

export default async function MyProfilePage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", session.user.id)
    .single();

  const fullName = profile?.full_name || session.user.user_metadata?.full_name || "";
  const email = profile?.email || session.user.email || "";
  const phone = profile?.phone || "";

  return (
    <div className="space-y-6 max-w-xl">
      <LguPageHeader title="My Profile" description="Manage your LGU admin account details." />
      <Card>
        <CardContent className="pt-6">
          <LguProfileForm fullName={fullName} email={email} phone={phone} />
        </CardContent>
      </Card>
      <MfaStatusCard />
    </div>
  );
}
