"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDocumentRequestAction } from "@/actions/workflow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

const ALL_REPORT_TYPES = [
  { value: "monthly", label: "Monthly Reports" },
  { value: "financial", label: "Financial Reports" },
  { value: "accomplishment", label: "Accomplishment Reports" },
  { value: "compliance", label: "Compliance Reports" },
  { value: "other", label: "Other (One-Time) Requests" },
];

export function RequestDocumentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState("financial");

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

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Request Title</label>
            <Input name="title" placeholder="e.g. FY 2026 Monthly Financial Plan" required />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Document Type</label>
            <input type="hidden" name="documentType" value={documentType} />
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ALL_REPORT_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Deadline</label>
            <Input name="deadline" type="date" required />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-foreground/70 mb-2">Instructions / Description</label>
            <textarea
              name="description"
              rows={5}
              required
              className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Provide instructions or guidelines for this document submission..."
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={loading} className="w-full sm:w-auto px-6 cursor-pointer">
              {loading ? "Sending Request..." : "Dispatch Request to All Barangays"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
