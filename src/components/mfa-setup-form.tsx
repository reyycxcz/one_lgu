"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function MfaSetupForm({
  redirectTo,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { redirectTo: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function enroll() {
      const supabase = createClient();

      // Clean up any abandoned/unverified enrollment from a previous attempt
      // first — Supabase rejects a new enroll() if one with the same (blank)
      // friendly name already exists for this user. `data.totp` is typed as
      // verified-only, so check `data.all` (verified + unverified) instead.
      const { data: existing } = await supabase.auth.mfa.listFactors();
      const stale = existing?.all.find((f) => f.factor_type === "totp" && f.status === "unverified");
      if (stale) {
        await supabase.auth.mfa.unenroll({ factorId: stale.id });
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });

      if (enrollError) {
        setError(enrollError.message);
        setLoading(false);
        return;
      }

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setSecret(data.totp.secret);
      setLoading(false);
    }

    enroll();
  }, []);

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
        <h1 className="text-2xl font-bold">Setting up two-factor authentication</h1>
        <p className="text-balance text-sm text-muted-foreground">One moment...</p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Set up two-factor authentication</h1>
        <p className="text-balance text-sm text-muted-foreground">
          This account type requires an authenticator app (Google Authenticator, Authy, 1Password, etc.)
          for additional login security.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {qrCode && (
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="Scan this QR code with your authenticator app" className="h-44 w-44 rounded-lg border border-border" />
          {secret && (
            <p className="text-xs text-muted-foreground text-center">
              Can&apos;t scan? Enter this code manually:{" "}
              <span className="font-mono font-semibold text-foreground">{secret}</span>
            </p>
          )}
        </div>
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
          />
        </div>
        <Button type="submit" className="w-full" disabled={verifying || code.length !== 6}>
          {verifying ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>
    </div>
  );
}
