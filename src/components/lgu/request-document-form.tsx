"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocumentRequestAction } from "@/actions/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { filterDocumentTypeGroups, RECURRENCE_OPTIONS } from "@/lib/documents/request-types";
import { BarangayRecipientPicker } from "@/components/lgu/barangay-recipient-picker";
import { toast } from "sonner";

interface RequestDocumentFormProps {
  // Populated when arriving via "Create Next Period" on an existing
  // recurring request — same title/type/description/recurrence to start
  // from, a suggested next deadline, and the series' recurrence_group_id
  // so this new cycle stays linked to the ones before it.
  prefill?: {
    title?: string;
    description?: string;
    documentType?: string;
    recurrence?: string;
    deadline?: string;
    recurrenceGroupId?: string;
  };
  // Undefined (super_admin, or no department scope) shows every type.
  // A department-scoped lgu_reviewer gets this narrowed to their
  // department's relevant types + "other" — same restriction the
  // department dashboard's quick-create sheet already applies, so this
  // full page can't be used to route around it.
  allowedTypes?: string[];
  // For the "specific barangay(s)" recipient picker — only shown for
  // one-time requests, since recurring compliance reports are expected
  // from every barangay.
  barangays: { id: string; name: string }[];
}

export function RequestDocumentForm({ prefill, allowedTypes, barangays }: RequestDocumentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typeGroups = filterDocumentTypeGroups(allowedTypes);
  const [documentType, setDocumentType] = useState(prefill?.documentType || typeGroups[0]?.items[0]?.value || "other");
  const [recurrence, setRecurrence] = useState(prefill?.recurrence || "one_time");
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
      recurrenceGroupId: prefill?.recurrenceGroupId,
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
    router.push("/lgu/requests/active");
    router.refresh();
  }

  return (
    <Card className="max-w-2xl border border-border/60 shadow-xs">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {prefill && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-primary text-xs font-semibold">
              Starting a new cycle for this recurring request — update the title's period reference (e.g. the month or quarter) before dispatching.
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Request Title</label>
            <Input name="title" defaultValue={prefill?.title} placeholder="e.g. FY 2026 Monthly Financial Plan" required />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Document Type</label>
              <input type="hidden" name="documentType" value={documentType} />
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {typeGroups.map((group) => (
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
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">
                Recurrence <span className="text-foreground/40 font-normal normal-case">(is this a repeating obligation?)</span>
              </label>
              <input type="hidden" name="recurrence" value={recurrence} />
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger>
                  <SelectValue placeholder="Select recurrence" />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {recurrence === "one_time" && (
            <BarangayRecipientPicker
              barangays={barangays}
              mode={recipientMode}
              onModeChange={setRecipientMode}
              selected={selectedBarangays}
              onSelectedChange={setSelectedBarangays}
            />
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Deadline</label>
            <Input name="deadline" type="date" defaultValue={prefill?.deadline} required />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Instructions / Description</label>
            <textarea
              name="description"
              rows={5}
              required
              defaultValue={prefill?.description}
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide instructions or guidelines for this document submission..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto px-6 cursor-pointer">
              {loading
                ? "Sending Request..."
                : recurrence === "one_time" && recipientMode === "specific"
                  ? "Dispatch Request to Selected Barangay(s)"
                  : "Dispatch Request to All Barangays"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
