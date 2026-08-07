"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, Info, Loader2, FileCheck2, X } from "lucide-react";
import { submitCertificationRequest } from "@/actions/certifications";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export default function NewCertificationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(selected: FileList | null) {
    if (!selected) return;
    const next: File[] = [];
    for (const f of Array.from(selected)) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`"${f.name}" is too large. Maximum is 5MB per file.`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(f.type)) {
        setError(`"${f.name}" is not a supported type. Use JPG, PNG, or PDF.`);
        continue;
      }
      next.push(f);
    }
    if (next.length > 0) setError(null);
    setFiles((prev) => [...prev, ...next].slice(0, 5));
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.delete("files");
    files.forEach((f) => formData.append("files", f));

    const result = await submitCertificationRequest(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to submit request. Please check the form and try again.");
      setLoading(false);
      return;
    }

    router.push("/resident/certifications");
  }

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <h1 className="font-display font-bold text-3xl text-foreground">Request Certificate</h1>
        <p className="text-sm text-foreground/60 mt-1">Fill out the required information and upload attachments.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-xl text-sm font-sans bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Certificate Type
              </label>
              <select
                name="type"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
                defaultValue=""
              >
                <option value="" disabled>Select certificate type...</option>
                <option value="barangay_clearance">Barangay Clearance</option>
                <option value="barangay_certificate">Barangay Certificate</option>
                <option value="certificate_of_residency">Certificate of Residency</option>
                <option value="certificate_of_indigency">Certificate of Indigency</option>
                <option value="business_clearance">Business Clearance</option>
                <option value="scholarship_certificate">Certificate for Scholarship Purposes</option>
                <option value="first_time_job_seeker">First-Time Job Seeker (RA 11261)</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Purpose
              </label>
              <textarea
                name="purpose"
                placeholder="Describe why you are requesting this certificate (e.g. Local employment requirements, Scholarship application, bank requirements, business permit application)..."
                rows={4}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Requirements Upload <span className="text-foreground/40 font-normal">(optional)</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Upload className="h-5 w-5 text-foreground/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Click to upload files</p>
                  <p className="text-xs text-foreground/50 mt-1">Valid ID or residency proofs (JPG, PNG, PDF up to 5MB, max 5 files)</p>
                </div>
              </button>

              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 text-xs">
                      <FileCheck2 className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate flex-1">{f.name}</span>
                      <span className="text-foreground/40 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-foreground/40 hover:text-red-600 shrink-0">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-white rounded-lg py-3 text-sm font-sans font-bold shadow-[0_4px_14px_-4px_rgba(0,177,94,0.55)] hover:brightness-105 active:brightness-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Submitting...
                </>
              ) : (
                "Submit Certificate Request"
              )}
            </button>
          </form>
        </div>

        {/* Informational sidebar */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2">
              <Info className="h-4.5 w-4.5" /> Attachment Rules
            </h3>
            <ul className="space-y-3 text-xs text-foreground/75 font-sans leading-relaxed">
              <li>
                <strong>Barangay Clearance:</strong> Requires 1 government-issued photo ID.
              </li>
              <li>
                <strong>Certificate of Indigency:</strong> Requires referral letter or proof of household low-income bracket.
              </li>
              <li>
                <strong>Business Permit:</strong> Requires DTI/SEC registration copy and lease contract.
              </li>
              <li>
                <strong>First-Time Job Seeker:</strong> Requires signed Oath of Undertaking under Republic Act 11261 (charges are waived).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
