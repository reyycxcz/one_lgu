"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBarangay, updateBarangay } from "@/actions/barangays";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil } from "lucide-react";

interface BarangayFormSheetProps {
  mode: "create" | "edit";
  barangay?: { id: string; name: string; code: string; municipality: string; province: string };
  trigger?: React.ReactNode;
}

export function BarangayFormSheet({ mode, barangay, trigger }: BarangayFormSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result =
      mode === "edit" && barangay
        ? await updateBarangay(barangay.id, formData)
        : await createBarangay(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Please check the form for errors");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="contents"
      >
        {trigger || (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Barangay
          </span>
        )}
      </button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{mode === "edit" ? "Edit Barangay" : "Add Barangay"}</SheetTitle>
          <SheetDescription>
            {mode === "edit"
              ? "Update this barangay's registered information."
              : "Register a new barangay in the municipality."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Barangay Name</label>
            <Input name="name" defaultValue={barangay?.name} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Code</label>
            <Input name="code" defaultValue={barangay?.code} placeholder="e.g. BGY-001" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Municipality</label>
            <Input name="municipality" defaultValue={barangay?.municipality || "Dingras"} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Province</label>
            <Input name="province" defaultValue={barangay?.province || "Ilocos Norte"} required />
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Barangay"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
