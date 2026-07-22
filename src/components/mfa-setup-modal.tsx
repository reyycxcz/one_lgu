"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface MfaSetupModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MfaSetupModal({ open, onClose, onSuccess }: MfaSetupModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  // Enroll a fresh factor whenever the modal opens.
  useEffect(() => {
    if (!open) {
      // reset for next time
      startedRef.current = false;
      setLoading(true);
      setError(null);
      setQrCode(null);
      setSecret(null);
      setFactorId(null);
      setCode("");
      setVerifying(false);
      setDone(false);
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;

    async function enroll() {
      const supabase = createClient();

      // Remove any abandoned unverified factor from a previous attempt so the
      // blank friendly name doesn't collide.
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
  }, [open]);

  // Auto-verify as soon as a full 6-digit code is entered.
  useEffect(() => {
    if (code.length !== 6 || !factorId || verifying || done) return;

    async function verify() {
      setVerifying(true);
      setError(null);

      const supabase = createClient();
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factorId!,
        code,
      });

      setVerifying(false);

      if (verifyError) {
        setError(verifyError.message || "Invalid code. Please try again.");
        setCode("");
        return;
      }

      setDone(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 900);
    }

    verify();
  }, [code, factorId, verifying, done, onSuccess, onClose]);

  // Escape to close + lock scroll
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !verifying) onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, verifying, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => !verifying && onClose()}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-2xl bg-white border border-border shadow-2xl p-6 font-sans"
          >
            <button
              onClick={() => !verifying && onClose()}
              className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>

            {done ? (
              <div className="flex flex-col items-center text-center gap-3 py-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h2 className="text-base font-bold text-foreground">Two-factor authentication enabled</h2>
                <p className="text-sm text-muted-foreground">Your account is now protected.</p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1 mb-5">
                  <h2 className="text-base font-bold text-foreground">Set up two-factor authentication</h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Scan the QR code with your authenticator app (Google Authenticator, Authy, 1Password), then enter the 6-digit code.
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs">Preparing setup...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    {qrCode && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={qrCode} alt="Scan with your authenticator app" className="h-40 w-40 rounded-lg border border-border" />
                    )}
                    {secret && (
                      <p className="text-[11px] text-muted-foreground text-center">
                        Can&apos;t scan? Enter manually:{" "}
                        <span className="font-mono font-semibold text-foreground break-all">{secret}</span>
                      </p>
                    )}

                    <div className="w-full">
                      <label className="block text-xs font-medium text-foreground/60 mb-1.5 text-center">
                        6-digit code
                      </label>
                      <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        autoFocus
                        disabled={verifying}
                        className="w-full h-11 rounded-lg border border-input bg-background text-center text-lg font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                      />
                      <div className="h-5 mt-2 flex items-center justify-center">
                        {verifying && (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin" /> Verifying...
                          </span>
                        )}
                      </div>
                    </div>

                    <Button type="button" variant="outline" className="w-full" onClick={onClose} disabled={verifying}>
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
