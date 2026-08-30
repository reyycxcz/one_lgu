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
import { Plus, Eye, EyeOff } from "lucide-react";

const POSITION_OPTIONS: BarangayPosition[] = ["captain", "secretary", "treasurer", "sk_chairman", "sk_secretary", "sk_treasurer"];

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl p-6 flex flex-col justify-between overflow-y-auto">
        <div>
          <SheetHeader className="text-left space-y-1">
            <SheetTitle className="text-lg font-semibold text-foreground">Add Barangay Official</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground">
              Set a temporary password. The official will be required to change it upon first login.
            </SheetDescription>
          </SheetHeader>

          <form id="create-official-form" onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <div role="alert" aria-live="assertive" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input name="fullName" placeholder="e.g. Juan Dela Cruz" required className="h-9 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input name="email" type="email" placeholder="official@dingras.gov.ph" required className="h-9 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Phone <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <Input name="phone" placeholder="09171234567" className="h-9 text-sm" />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Barangay <span className="text-red-500">*</span>
                </label>
                <input type="hidden" name="barangayId" value={barangayId} />
                <Select value={barangayId} onValueChange={setBarangayId}>
                  <SelectTrigger className="h-9 text-sm">
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
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Position <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input type="hidden" name="position" value={position} />
                <Select value={position} onValueChange={setPosition}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    {POSITION_OPTIONS.map((p) => (
                      <SelectItem key={p} value={p}>{POSITION_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Temporary Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="••••••••"
                    required
                    className="h-9 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Min 8 chars, letter & number.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/70 mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    minLength={8}
                    placeholder="••••••••"
                    required
                    className="h-9 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
            form="create-official-form"
            disabled={loading || !barangayId}
            size="sm"
            className="bg-primary text-white hover:bg-primary/90"
          >
            {loading ? "Creating..." : "Add Official"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
