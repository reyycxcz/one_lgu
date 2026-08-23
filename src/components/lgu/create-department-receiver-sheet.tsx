"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLguReceiver } from "@/actions/profile";
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
import { DEPARTMENT_LABELS, type LguDepartment } from "@/lib/auth/departments";
import { Plus } from "lucide-react";

const DEPARTMENT_OPTIONS = Object.keys(DEPARTMENT_LABELS) as LguDepartment[];

export function CreateDepartmentReceiverSheet() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [department, setDepartment] = useState("");

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
    const result = await createLguReceiver(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Please check the form for errors");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    setDepartment("");
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => setOpen(true)} className="contents">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-md text-xs font-semibold hover:bg-primary/90 transition-colors">
          <Plus className="h-3.5 w-3.5" /> Add Department Receiver
        </span>
      </button>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Department Receiver</SheetTitle>
          <SheetDescription>
            Creates an LGU reviewer account scoped to one office — it only ever sees the report type that office handles. Set a temporary password and share it yourself; they&apos;ll be required to change it on first login.
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
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Department</label>
            <input type="hidden" name="department" value={department} />
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENT_OPTIONS.map((d) => (
                  <SelectItem key={d} value={d}>{DEPARTMENT_LABELS[d]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" disabled={loading || !department} className="w-full sm:w-auto">
              {loading ? "Creating..." : "Add Department Receiver"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
