"use client";

import { useState } from "react";
import { updatePassword } from "@/actions/profile";

export default function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
        <div className={`p-3 rounded-xl text-sm font-sans ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">New Password</label>
          <input
            type="password"
            name="newPassword"
            minLength={8}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            minLength={8}
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
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
