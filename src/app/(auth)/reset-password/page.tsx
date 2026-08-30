"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginPageLayout } from "@/components/login-form";
import { createClient } from "@/lib/supabase/client";
import { strongPasswordSchema } from "@/lib/validations/profile.schema";

import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // The recovery link establishes a temporary session client-side; wait for
    // Supabase to signal it before allowing the form to be used.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    const parsed = strongPasswordSchema.safeParse(newPassword);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const supabase = createClient();
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
          Redirecting you to login...
        </p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className={cn("flex flex-col gap-6 font-sans text-center", className)}>
        <h1 className="text-2xl font-bold">Verifying link</h1>
        <p className="text-balance text-sm text-muted-foreground">
          If this takes more than a few seconds, your reset link may have expired. Request a new one from the login page.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Set a new password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Choose a new password for your account
        </p>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              minLength={8}
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
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              minLength={8}
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
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <LoginPageLayout formTitle="Digitalizing Local Government">
      <ResetPasswordForm />
    </LoginPageLayout>
  );
}
