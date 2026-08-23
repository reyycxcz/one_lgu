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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { FileArrowUp } from "@phosphor-icons/react";
import { toast } from "sonner";

interface RequestDocumentSheetProps {
  defaultDocumentType?: string;
  allowedTypes: string[];
}

const ALL_REPORT_TYPES = [
  { value: "monthly", label: "Monthly Reports" },
  { value: "financial", label: "Financial Reports" },
  { value: "accomplishment", label: "Accomplishment Reports" },
  { value: "compliance", label: "Compliance Reports" },
  { value: "other", label: "Other (One-Time) Requests" },
];

export function RequestDocumentSheet({ defaultDocumentType, allowedTypes }: RequestDocumentSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState(defaultDocumentType || allowedTypes[0] || "financial");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const deadline = formData.get("deadline") as string;

    const result = await createDocumentRequestAction(
      title,
      description,
      deadline
    );

    if (result?.error) {
      setError(result.error as string);
      setLoading(false);
      return;
    }

    toast.success("Document request dispatched to all active barangay officials!");
    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  // Filter options to either the department's allowed types, or show all if none are routed
  const visibleOptions = allowedTypes.length > 0
    ? ALL_REPORT_TYPES.filter(opt => allowedTypes.includes(opt.value) || opt.value === "other")
    : ALL_REPORT_TYPES;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
          <FileArrowUp className="h-3.5 w-3.5" /> Request Document
        </span>
      </button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Request Document from Barangays</SheetTitle>
          <SheetDescription>
            This will send a notification request to all active Barangay Officials. They will see the request in their compliance list and can submit the document directly.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Request Title</label>
            <Input name="title" placeholder="e.g. FY 2026 Monthly Financial Plan" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Document Type</label>
            <input type="hidden" name="documentType" value={documentType} />
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {visibleOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Deadline</label>
            <Input name="deadline" type="date" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Instructions / Description</label>
            <textarea
              name="description"
              rows={4}
              required
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide context or instructions for this submission..."
            />
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
