"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBarangayOfficial } from "@/actions/profile";
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
import { POSITION_LABELS, type BarangayPosition } from "@/lib/auth/positions";
import { Plus } from "lucide-react";

const POSITION_OPTIONS: BarangayPosition[] = ["captain", "secretary", "treasurer"];

interface CreateOfficialSheetProps {
  barangays: { id: string; name: string }[];
}

export function CreateOfficialSheet({ barangays }: CreateOfficialSheetProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [barangayId, setBarangayId] = useState("");
  const [position, setPosition] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    const result = await createBarangayOfficial(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Please check the form for errors");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setBarangayId("");
    setPosition("");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Official
        </span>
      </button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Barangay Official</SheetTitle>
          <SheetDescription>
            Set a temporary password and share it with the official yourself — they&apos;ll be required to change it the first time they log in. Position can be changed anytime from this list.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Full Name</label>
            <Input name="fullName" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Email</label>
            <Input name="email" type="email" required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Phone (optional)</label>
            <Input name="phone" placeholder="09171234567" />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Temporary Password</label>
            <Input name="password" type="password" minLength={8} required />
            <p className="text-[10px] text-foreground/40 mt-1">At least 8 characters, with a letter and a number.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Confirm Password</label>
            <Input name="confirmPassword" type="password" minLength={8} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Barangay</label>
            <input type="hidden" name="barangayId" value={barangayId} />
            <Select value={barangayId} onValueChange={setBarangayId}>
              <SelectTrigger>
                <SelectValue placeholder="Select barangay" />
              </SelectTrigger>
              <SelectContent>
                {barangays.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Position (optional)</label>
            <input type="hidden" name="position" value={position} />
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                {POSITION_OPTIONS.map((p) => (
                  <SelectItem key={p} value={p}>{POSITION_LABELS[p]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" disabled={loading || !barangayId} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Add Official"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
