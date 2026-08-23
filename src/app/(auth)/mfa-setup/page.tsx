import { requireProfile } from "@/lib/auth/session";
import { LoginPageLayout } from "@/components/login-form";
import { MfaSetupForm } from "@/components/mfa-setup-form";

export default async function MfaSetupPage() {
  const profile = await requireProfile();

  let redirectTo = "/resident/dashboard";
  if (profile.role === "super_admin") {
    redirectTo = "/lgu/dashboard";
  } else if (profile.role === "lgu_reviewer") {
    redirectTo = profile.department ? "/lgu/department/dashboard" : "/lgu/dashboard";
  } else if (profile.role === "barangay_official") {
    redirectTo = "/barangay/dashboard";
  }

  return (
    <LoginPageLayout formTitle="Digitalizing Local Government">
      <MfaSetupForm redirectTo={redirectTo} />
    </LoginPageLayout>
  );
}
