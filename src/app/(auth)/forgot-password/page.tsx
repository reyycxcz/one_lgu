"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoginPageLayout } from "@/components/login-form";

function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  return (
    <form className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email address to receive a recovery link
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="your email" required />
        </div>
        <Button type="submit" className="w-full">
          Send Reset Link
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
