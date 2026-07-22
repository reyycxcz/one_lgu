"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginPageLayout } from "@/components/login-form";
import { forgotPassword } from "@/actions/auth";

function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result: Record<string, unknown> = await forgotPassword(formData);

    if (result.error) {
      setError(typeof result.error === "string" ? result.error : "Please enter a valid email address");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className={cn("flex flex-col gap-6 font-sans text-center", className)}>
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-balance text-sm text-muted-foreground">
          If an account exists for that email address, we&apos;ve sent a link to reset your password.
        </p>
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email address to receive a recovery link
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="your email" required />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </div>
      <div className="text-center text-sm">
        Remember password?{" "}
        <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">
          Log in here
        </Link>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <LoginPageLayout formTitle="Digitalizing Local Government">
      <ForgotPasswordForm />
    </LoginPageLayout>
  );
}
