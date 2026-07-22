"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/actions/announcements";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_OPTIONS = [
  { value: "general", label: "Announcement" },
  { value: "certification_guide", label: "Certification Guide" },
  { value: "dispute_mediation", label: "Dispute Mediation" },
  { value: "livelihood_programs", label: "Livelihood Programs" },
  { value: "clean_and_green", label: "Clean & Green" },
];

export function AnnouncementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState<"draft" | "publish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, intent: "draft" | "publish") {
    e.preventDefault();
    setLoading(intent);
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    formData.set("intent", intent);

    const result: Record<string, unknown> = await createAnnouncement(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Please check the form for errors");
      setLoading(null);
      return;
    }

    setLoading(null);
    setSuccess(intent === "publish" ? "Announcement published and sent to residents." : "Draft saved.");
    (e.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form
          onSubmit={(e) => handleSubmit(e, (e.nativeEvent as SubmitEvent).submitter?.getAttribute("data-intent") === "publish" ? "publish" : "draft")}
          className="space-y-4"
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
              {success}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Category</label>
            <select
              name="category"
              defaultValue="general"
              required
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Title</label>
            <Input name="title" placeholder="e.g. Free Livelihood Seminars & Skills Training" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Tag</label>
            <Input name="tag" placeholder="e.g. Upcoming Events" required />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Excerpt</label>
            <textarea
              name="excerpt"
              rows={2}
              placeholder="Short summary shown on the landing page card"
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Body</label>
            <textarea
              name="body"
              rows={10}
              placeholder="Full announcement content. Separate paragraphs with a blank line."
              required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" data-intent="publish" disabled={loading !== null}>
              {loading === "publish" ? "Publishing..." : "Publish & Notify Residents"}
            </Button>
            <Button type="submit" data-intent="draft" variant="outline" disabled={loading !== null}>
              {loading === "draft" ? "Saving..." : "Save as Draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
