"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MfaSetupModal } from "@/components/mfa-setup-modal";
import { createClient } from "@/lib/supabase/client";

export function MfaStatusCard() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.auth.mfa.listFactors();
    const verified = data?.totp.find((f) => f.status === "verified");
    setEnabled(!!verified);
    setFactorId(verified?.id || null);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleDisable() {
    if (!factorId) return;

    setDisabling(true);
    setError(null);
    const supabase = createClient();
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setDisabling(false);
    setConfirmOpen(false);

    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }

    refresh();
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Checking two-factor authentication status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${enabled ? "bg-primary/10 text-primary" : "bg-amber-50 text-amber-600"}`}>
              {enabled ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {enabled
                  ? "Enabled — your account requires an authenticator app code on every new login."
                  : "Not enabled — add an extra layer of security by requiring an authenticator app code at login. Optional, but recommended for staff accounts."}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
          )}

          {enabled ? (
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)} disabled={disabling}>
              {disabling ? "Turning off..." : "Turn Off Two-Factor Authentication"}
            </Button>
          ) : (
            <Button type="button" onClick={() => setSetupOpen(true)}>
              Set Up Two-Factor Authentication
            </Button>
          )}
        </CardContent>
      </Card>

      <MfaSetupModal
        open={setupOpen}
        onClose={() => setSetupOpen(false)}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={confirmOpen}
        variant="destructive"
        title="Turn off two-factor authentication?"
        description="Your account will no longer require an authenticator code at login. You can re-enable it anytime from this page."
        confirmLabel="Turn Off"
        cancelLabel="Keep Enabled"
        loading={disabling}
        onConfirm={handleDisable}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
