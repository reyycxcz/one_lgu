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
      <SheetContent className="w-full sm:max-w-lg md:max-w-xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-lg font-semibold text-foreground">{mode === "edit" ? "Edit Barangay" : "Add Barangay"}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              {mode === "edit"
                ? "Update this barangay's registered information."
                : "Register a new barangay in the municipality."}
            </SheetDescription>
          </SheetHeader>

          <form id="barangay-form" onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Barangay Name <span className="text-red-500">*</span>
                </label>
                <Input name="name" defaultValue={barangay?.name} placeholder="e.g. San Pedro" required className="h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Code <span className="text-red-500">*</span>
                </label>
                <Input name="code" defaultValue={barangay?.code} placeholder="e.g. BGY-001" required className="h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Municipality <span className="text-red-500">*</span>
                </label>
                <Input name="municipality" defaultValue={barangay?.municipality || "Dingras"} required className="h-9 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Province <span className="text-red-500">*</span>
                </label>
                <Input name="province" defaultValue={barangay?.province || "Ilocos Norte"} required className="h-9 text-sm" />
              </div>
            </div>
          </form>
        </div>

        <SheetFooter className="pt-4 border-t mt-4 flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="barangay-form"
            disabled={loading}
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Saving..." : mode === "edit" ? "Save Changes" : "Add Barangay"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
