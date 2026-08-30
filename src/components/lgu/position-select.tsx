"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setBarangayPosition } from "@/actions/profile";
import { POSITION_LABELS, type BarangayPosition } from "@/lib/auth/positions";

export function PositionSelect({
  userId,
  position,
  isSk = false,
}: {
  userId: string;
  position: BarangayPosition | null;
  isSk?: boolean;
}) {
  const options = (isSk
    ? ["", "sk_chairman", "sk_secretary", "sk_treasurer"]
    : ["", "captain", "secretary", "treasurer"]) as (BarangayPosition | "")[];
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as BarangayPosition | "";
    setError(null);
    startTransition(async () => {
      const result = await setBarangayPosition(userId, value || null);
      if (result?.error) {
        setError(typeof result.error === "string" ? result.error : "Update failed");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <select
        defaultValue={position || ""}
        onChange={handleChange}
        disabled={isPending}
        className="text-[11px] font-semibold rounded-md border border-border bg-white px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt ? POSITION_LABELS[opt] : "Unassigned"}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
