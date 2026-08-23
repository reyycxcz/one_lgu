import { requireProfile } from "@/lib/auth/session";
import { LoginPageLayout } from "@/components/login-form";
import { MfaChallengeForm } from "@/components/mfa-challenge-form";

export default async function MfaChallengePage() {
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
      <MfaChallengeForm redirectTo={redirectTo} />
    </LoginPageLayout>
  );
}
