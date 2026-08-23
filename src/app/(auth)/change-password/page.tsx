import { requireProfile } from "@/lib/auth/session";
import { LoginPageLayout } from "@/components/login-form";
import { ChangePasswordForm } from "@/components/change-password-form";

export default async function ChangePasswordPage() {
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
      <ChangePasswordForm redirectTo={redirectTo} />
    </LoginPageLayout>
  );
}
