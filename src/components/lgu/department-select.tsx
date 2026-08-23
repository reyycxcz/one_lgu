"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLguDepartment } from "@/actions/profile";
import { DEPARTMENT_LABELS, type LguDepartment } from "@/lib/auth/departments";

const DEPARTMENT_OPTIONS: (LguDepartment | "")[] = ["", ...(Object.keys(DEPARTMENT_LABELS) as LguDepartment[])];

export function DepartmentSelect({ userId, department }: { userId: string; department: LguDepartment | null }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as LguDepartment | "";
    setError(null);
    startTransition(async () => {
      const result = await setLguDepartment(userId, value || null);
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
        defaultValue={department || ""}
        onChange={handleChange}
        disabled={isPending}
        className="text-[11px] font-semibold rounded-md border border-border bg-white px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {DEPARTMENT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt ? DEPARTMENT_LABELS[opt] : "Unassigned"}
          </option>
        ))}
      </select>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
