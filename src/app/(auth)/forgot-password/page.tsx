"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginPageLayout } from "@/components/login-form";
import { OtpInput } from "@/components/ui/otp-input";
import { createClient } from "@/lib/supabase/client";
import { strongPasswordSchema } from "@/lib/validations/profile.schema";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { Eye, EyeOff } from "lucide-react";

type Step = "email" | "code";

function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [resent, setResent] = useState(false);

  // Step 1 — send the 6-digit recovery code to the email.
  async function sendCode(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const captchaToken = new FormData(e.currentTarget).get("cf-turnstile-response") as string | undefined;
    const supabase = createClient();
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      captchaToken: captchaToken || undefined,
    });

    setLoading(false);
    // Always advance (don't reveal whether the email exists — anti-enumeration).
    if (sendError && !/rate|limit/i.test(sendError.message)) {
      // Still move forward on generic errors to avoid leaking account existence,
      // but surface true rate-limit messages so the user knows to wait.
      setStep("code");
      return;
    }
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setStep("code");
  }

  async function resendCode() {
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (sendError) {
      setError(sendError.message);
      return;
    }
    setResent(true);
  }

  // Step 2 — verify the code, then set the new password.
  async function verifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (code.trim().length !== 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    const parsedPassword = strongPasswordSchema.safeParse(newPassword);
    if (!parsedPassword.success) {
      setError(parsedPassword.error.issues[0].message);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "recovery",
    });

    if (verifyError) {
      setLoading(false);
      setError(verifyError.message || "Invalid or expired code. Please try again.");
      setCode("");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (success) {
    return (
      <div className={cn("flex flex-col gap-6 font-sans text-center", className)}>
        <h1 className="text-2xl font-bold">Password updated</h1>
        <p className="text-balance text-sm text-muted-foreground">
          You can now log in with your new password. Redirecting...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {step === "email"
            ? "Enter your email and we'll send you a 6-digit code."
            : `Enter the code sent to ${email} and choose a new password.`}
        </p>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}
      {resent && !error && (
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
          A new code has been sent.
        </div>
      )}

      {step === "email" ? (
        <form onSubmit={sendCode} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your email"
              required
            />
          </div>
          <TurnstileWidget />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verifyAndReset} className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="code">6-digit code</Label>
            <OtpInput id="code" value={code} onChange={setCode} autoFocus />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newPassword">New password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Updating..." : "Verify & Update Password"}
          </Button>
          <div className="text-center text-xs text-muted-foreground">
            Didn&apos;t get a code?{" "}
            <button type="button" onClick={resendCode} className="font-semibold text-primary hover:underline">
              Resend
            </button>
          </div>
        </form>
      )}

      <div className="text-center text-sm">
        Remember password?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in here
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <LoginPageLayout formTitle="Digitalizing Local Government">
      <ForgotPasswordForm />
    </LoginPageLayout>
  );
}
