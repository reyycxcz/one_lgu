import { requireSession } from "@/lib/auth/session";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { MfaStatusCard } from "@/components/mfa-status-card";
import PasswordForm from "./password-form";

export default async function ChangePasswordPage() {
  await requireSession();

  return (
    <div className="space-y-6 max-w-xl">
      <LguPageHeader title="Change Password" description="Update the password and security settings for your LGU admin account." />
      <Card>
        <CardContent className="pt-6">
          <PasswordForm />
        </CardContent>
      </Card>
      <MfaStatusCard />
    </div>
  );
}
