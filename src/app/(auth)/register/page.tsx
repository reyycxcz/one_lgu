"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/actions/auth";
import { LoginPageLayout } from "@/components/login-form";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";

function RegisterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [policyOpen, setPolicyOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await register(formData);

      if (result?.error) {
        const errorMsg = typeof result.error === "string"
          ? result.error
          : typeof result.error === "object"
            ? Object.values(result.error).flat().join(", ")
            : "Registration failed. Please try again.";
        setError(errorMsg);
        setLoading(false);
        return;
      }

      setSuccess(true);

      if (result?.redirectTo) {
        router.push(result.redirectTo);
        return; // keep loading state while navigating
      }

      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Sign up to request certificates and file complaints
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Account created successfully! Redirecting...
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" name="fullName" type="text" placeholder="your name" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="your email" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer select-none">
          <input
            type="checkbox"
            name="consent"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            required
            className="mt-0.5 h-3.5 w-3.5 rounded border-input accent-primary shrink-0"
          />
          <span>
            I have read and agree to the{" "}
            <button
              type="button"
              onClick={() => setPolicyOpen(true)}
              className="font-semibold text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </button>{" "}
            and consent to the collection and processing of my personal data as described.
          </span>
        </label>

        <TurnstileWidget />
        <Button type="submit" className="w-full" disabled={loading || success || !consent}>
          {success ? "Account created!" : loading ? "Creating account..." : "Create Account"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Already registered?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in here
        </Link>
      </div>

      <PrivacyPolicyModal open={policyOpen} onClose={() => setPolicyOpen(false)} />
    </form>
  );
}

export default function RegisterPage() {
  return (
    <LoginPageLayout formTitle="Digitalizing Local Government">
      <RegisterForm />
    </LoginPageLayout>
  );
}
