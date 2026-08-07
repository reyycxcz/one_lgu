"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function MfaChallengeForm({
  redirectTo,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { redirectTo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function loadFactor() {
      const supabase = createClient();
      const { data, error: listError } = await supabase.auth.mfa.listFactors();

      if (listError) {
        setError(listError.message);
        setLoading(false);
        return;
      }

      const verified = data.totp.find((f) => f.status === "verified");
      if (!verified) {
        router.push("/mfa-setup");
        return;
      }

      setFactorId(verified.id);
      setLoading(false);
    }

    loadFactor();
  }, [router]);

  async function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!factorId) return;

    setVerifying(true);
    setError(null);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message || "Invalid code. Please try again.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  if (loading) {
    return (
      <div className={cn("flex flex-col gap-6 font-sans text-center", className)} {...props}>
        <h1 className="text-2xl font-bold">Verifying your account</h1>
        <p className="text-balance text-sm text-muted-foreground">One moment...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Enter your authentication code</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Open your authenticator app and enter the current 6-digit code.
        </p>
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <form onSubmit={handleVerify} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="code">6-digit code</Label>
          <Input
            id="code"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            placeholder="123456"
            required
            autoFocus
          />
        </div>
        <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
          {verifying ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
