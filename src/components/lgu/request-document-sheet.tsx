"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocumentRequestAction } from "@/actions/workflow";
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { filterDocumentTypeGroups, RECURRENCE_OPTIONS } from "@/lib/documents/request-types";
import { BarangayRecipientPicker } from "@/components/lgu/barangay-recipient-picker";
import { FileArrowUp } from "@phosphor-icons/react";
import { toast } from "sonner";

interface RequestDocumentSheetProps {
  defaultDocumentType?: string;
  allowedTypes: string[];
  barangays: { id: string; name: string }[];
}

export function RequestDocumentSheet({ defaultDocumentType, allowedTypes, barangays }: RequestDocumentSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState(defaultDocumentType || allowedTypes[0] || "monthly");
  const [recurrence, setRecurrence] = useState("one_time");
  const [recipientMode, setRecipientMode] = useState<"all" | "specific">("all");
  const [selectedBarangays, setSelectedBarangays] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (recurrence === "one_time" && recipientMode === "specific" && selectedBarangays.length === 0) {
      setError("Select at least one barangay, or switch to All Active Barangays.");
      return;
    }

    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    const result = await createDocumentRequestAction(title, description, deadline, {
      documentType,
      recurrence,
      targetBarangays: recurrence === "one_time" && recipientMode === "specific" ? selectedBarangays : undefined,
    });

    if (result?.error) {
      setError(result.error as string);
      setLoading(false);
      return;
    }

    toast.success(
      recurrence === "one_time" && recipientMode === "specific"
        ? "Document request dispatched to the selected barangay(s)!"
        : "Document request dispatched to all active barangay officials!"
    );
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  // Scope the dropdown to the department's relevant types, always with
  // "other" as a catch-all. A department with no mapping (allowedTypes
  // empty) safely defaults to "other" only, not the full list.
  const visibleGroups = filterDocumentTypeGroups(allowedTypes);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
          <FileArrowUp className="h-3.5 w-3.5" /> Request Document
        </span>
      </button>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-lg font-semibold text-foreground">Request Document from Barangays</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Dispatches a compliance request to active Barangay Officials to submit reports directly.
            </SheetDescription>
          </SheetHeader>

          <form id="request-doc-form" onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Request Title <span className="text-red-500">*</span>
                </label>
                <Input name="title" placeholder="e.g. FY 2026 Monthly Financial Plan" required className="h-9 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Document Type <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="documentType" value={documentType} />
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {visibleGroups.map((group) => (
                      <SelectGroup key={group.group}>
                        <SelectLabel>{group.group}</SelectLabel>
                        {group.items.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <Input name="deadline" type="date" required className="h-9 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">Recurrence</label>
                <input type="hidden" name="recurrence" value={recurrence} />
                <Select value={recurrence} onValueChange={setRecurrence}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {recurrence === "one_time" && (
                <div className="sm:col-span-2">
                  <BarangayRecipientPicker
                    barangays={barangays}
                    mode={recipientMode}
                    onModeChange={setRecipientMode}
                    selected={selectedBarangays}
                    onSelectedChange={setSelectedBarangays}
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Instructions / Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={3}
                  required
                  className="flex min-h-[70px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Provide context or instructions for this submission..."
                />
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
            form="request-doc-form"
            disabled={loading}
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
