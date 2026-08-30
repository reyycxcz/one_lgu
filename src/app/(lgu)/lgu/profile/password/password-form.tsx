"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/profile";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      setMessage({ type: "error", text: typeof result.error === "string" ? result.error : "Failed to update password" });
    } else if (result?.success) {
      setMessage({ type: "success", text: "Password updated successfully!" });
      e.currentTarget.reset();
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {message && (
        <div role="status" aria-live="polite" className={`p-3 rounded-xl text-sm font-sans ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              name="newPassword"
              minLength={8}
              className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
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
        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              minLength={8}
              className="w-full px-4 py-2.5 pr-10 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
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
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-sans text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
