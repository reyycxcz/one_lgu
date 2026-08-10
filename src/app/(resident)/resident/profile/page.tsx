import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { MfaStatusCard } from "@/components/mfa-status-card";
import { DataPrivacyCard } from "@/components/data-privacy-card";
import ProfileForm from "./profile-form";

export default async function ResidentProfilePage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, barangays(name, code, municipality)")
    .eq("id", session.user.id)
    .single();

  const userMeta = session.user.user_metadata || {};

  const fullName = profile?.full_name || userMeta.full_name || session.user.email || "";
  const email = profile?.email || session.user.email || "";
  const phone = profile?.phone || "";
  const address = profile?.address || "";
  const barangayCode = (profile?.barangays as { code: string } | null)?.code || userMeta.barangay_code || "";
  const municipality = (profile?.barangays as { municipality: string } | null)?.municipality || userMeta.municipality || "";

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="font-display font-bold text-3xl text-foreground">Profile Settings</h1>
        <p className="text-sm text-foreground/55 mt-1">Manage your contact details and residency information.</p>
      </div>

      <ProfileForm
        fullName={fullName}
        email={email}
        phone={phone}
        address={address}
        barangayCode={barangayCode}
        municipality={municipality}
      />

      <div className="max-w-2xl space-y-6">
        <MfaStatusCard />
        <DataPrivacyCard />
      </div>
    </div>
  );
}
