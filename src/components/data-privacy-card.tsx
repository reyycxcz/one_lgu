"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteMyAccount } from "@/actions/profile";

// Data-subject rights (RA 10173): export a copy of everything tied to this
// account, or request deletion. Deletion anonymizes rather than hard-deletes
// (see deleteMyAccount) — the UI copy below reflects that honestly instead
// of promising a full erasure the backend can't do for records with
// submission history.
export function DataPrivacyCard({ allowDelete = true }: { allowDelete?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    const result = await deleteMyAccount(confirmText);
    setDeleting(false);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to delete account.");
      return;
    }

    router.push("/login");
  }

  return (
    <Card>
      <CardContent className="pt-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-foreground">Your Data</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Download a copy of everything tied to your account, or request that your account be deleted.
          </p>
        </div>

        <div>
          <Button type="button" variant="outline" asChild>
            <a href="/api/account/export" download>
              <Download className="h-4 w-4" /> Export My Data
            </a>
          </Button>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Downloads a JSON file with your profile and everything you&apos;ve submitted (certification requests, complaints, reports, notifications).
          </p>
        </div>

        <div className="pt-4 border-t border-border">
          {!allowDelete ? (
            <p className="text-[11px] text-muted-foreground">
              Account deletion isn&apos;t available for the super admin role — transfer super admin to another account first via User Management if you want to delete this one.
            </p>
          ) : !confirming ? (
            <Button type="button" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirming(true)}>
              <Trash2 className="h-4 w-4" /> Delete My Account
            </Button>
          ) : (
            <div className="space-y-3 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-xs text-red-800 font-medium">
                This deactivates your account and removes your personal information (name, email, phone, address) from it.
                Records you submitted (certifications, complaints, reports) are kept — not tied to your identity anymore, but retained for the municipality&apos;s legal records requirements — so this can&apos;t be fully undone. Type <strong>DELETE</strong> to confirm.
              </p>

              {error && (
                <div role="alert" aria-live="assertive" className="text-xs text-red-700 font-medium">{error}</div>
              )}

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE"
                className="w-full h-9 px-3 rounded-md border border-red-300 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-destructive"
                disabled={deleting}
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="destructive"
                  disabled={deleting || confirmText.trim().toUpperCase() !== "DELETE"}
                  onClick={handleDelete}
                >
                  {deleting ? "Deleting..." : "Permanently Delete"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting}
                  onClick={() => {
                    setConfirming(false);
                    setConfirmText("");
                    setError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
