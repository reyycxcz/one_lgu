"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/actions/auth";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await login(formData);

      if (result?.error) {
        const fallback = "Something went wrong signing you in. Please try again in a moment.";
        let errorMsg: string = fallback;
        if (typeof result.error === "string" && result.error.trim() !== "") {
          errorMsg = result.error;
        } else if (result.error && typeof result.error === "object") {
          const vals = Object.values(result.error as Record<string, unknown>)
            .flat()
            .filter((v): v is string => typeof v === "string" && v.trim() !== "");
          errorMsg = vals.length > 0 ? vals.join(", ") : fallback;
        }
        // Never surface a raw/empty-looking value like "{}" or "[]" to the user.
        if (!errorMsg || errorMsg.trim() === "" || errorMsg.trim() === "{}" || errorMsg.trim() === "[]") {
          errorMsg = fallback;
        }
        setError(errorMsg);
      } else if (result?.redirectTo) {
        router.push(result.redirectTo);
        return; // keep loading state while navigating
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your credentials to access your portal
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="your email" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm text-primary underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
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
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Log In to Portal"}
        </Button>
      </div>
      <div className="text-center text-sm">
        New resident?{" "}
        <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function LoginPageLayout({
  formTitle,
  children,
}: {
  formTitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 font-sans">
      <div className="relative hidden lg:block">
        <Image
          src="/images/dingras-hall.png"
          fill
          priority
          className="object-cover"
          alt="Dingras Municipal Hall"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/10 to-transparent" />
      </div>

      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/images/logo/landscape_logo.png"
              width={340}
              height={97}
              className="h-11 w-auto object-contain"
              alt="OneLGU Logo"
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
    </div>
  );
}
