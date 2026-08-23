"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, ShieldAlert, Info, Loader2, FileCheck2, X, Wrench, Scale } from "lucide-react";
import { submitComplaint } from "@/actions/complaints";
import { SERVICE_REPORT_CATEGORIES, DISPUTE_CATEGORIES } from "@/lib/complaints/taxonomy";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

type RecordType = "service_report" | "formal_complaint";

export default function NewComplaintPage() {
  const router = useRouter();
  const [recordType, setRecordType] = useState<RecordType | null>(null);
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

    const result = await submitComplaint(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to submit. Please check the form and try again.");
      setLoading(false);
      return;
    }

    router.push("/resident/complaints");
  }

  // Step 1: pick what kind of record this is — everything else depends on it.
  if (!recordType) {
    return (
      <div className="space-y-8 animate-stagger-in max-w-3xl">
        <div>
          <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-foreground/60 hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to List
          </Link>
          <h1 className="font-display font-bold text-3xl text-foreground">What would you like to file?</h1>
          <p className="text-sm text-foreground/60 mt-1">Choose the option that best matches your situation.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <button
            type="button"
            onClick={() => setRecordType("service_report")}
            className="bryl-card p-6 text-left space-y-3 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-display font-semibold text-lg">Community / Service Report</h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              A barangay facility, infrastructure, sanitation, or safety concern — e.g. a broken streetlight, uncollected garbage, or a damaged road. Handled as an administrative service request, not a dispute.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setRecordType("formal_complaint")}
            className="bryl-card p-6 text-left space-y-3 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="h-11 w-11 rounded-xl bg-destructive/10 flex items-center justify-center">
              <Scale className="h-5 w-5 text-destructive" />
            </div>
            <h2 className="font-display font-semibold text-lg">Formal Complaint / Dispute</h2>
            <p className="text-xs text-foreground/60 leading-relaxed">
              A dispute against a specific person — e.g. a neighbor, property, or personal dispute. May be referred to barangay conciliation (mediation) if applicable.
            </p>
          </button>
        </div>
      </div>
    );
  }

  const isService = recordType === "service_report";

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <button
          type="button"
          onClick={() => setRecordType(null)}
          className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-foreground/60 hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Change Type
        </button>
        <h1 className="font-display font-bold text-3xl text-foreground">
          {isService ? "Submit a Community Report" : "File a Formal Complaint"}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">
          {isService
            ? "Describe the concern and, if relevant, where and when it happened."
            : "Describe the incident details and attach evidence (photos or documents)."}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          {error && (
            <div role="alert" aria-live="assertive" className="p-3 rounded-xl text-sm font-sans bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input type="hidden" name="record_type" value={recordType} />

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">Category</label>
              <select
                name="type"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
                defaultValue=""
              >
                <option value="" disabled>Select a category...</option>
                {isService
                  ? SERVICE_REPORT_CATEGORIES.map((group) => (
                      <optgroup key={group.group} label={group.group}>
                        {group.items.map((item) => (
                          <option key={item.value} value={item.value}>{item.label}</option>
                        ))}
                      </optgroup>
                    ))
                  : DISPUTE_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>{item.label}</option>
                    ))}
              </select>
            </div>

            <div className={isService ? "grid sm:grid-cols-2 gap-6" : "grid sm:grid-cols-2 gap-6"}>
              <div>
                <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                  {isService ? "Report Title" : "Subject"}
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder={isService ? "e.g. Broken streetlight along Rizal St." : "e.g. Boundary Fence Dispute, Noise Disturbance..."}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              {isService ? (
                <div>
                  <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                    Location <span className="text-foreground/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="e.g. Purok 3, near the basketball court"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                    Respondent / Involved Party
                  </label>
                  <input
                    type="text"
                    name="respondent_name"
                    placeholder="e.g. Full name or property address..."
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {isService && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                    Date/Time of Incident <span className="text-foreground/40 font-normal">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="incident_at"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">Priority</label>
                  <select
                    name="priority"
                    defaultValue="medium"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                {isService ? "Description" : "Detailed Incident Description"}
              </label>
              <textarea
                name="description"
                placeholder={isService ? "Describe the concern in detail..." : "Provide a detailed timeline of events, including dates, times, and exact details of the incident..."}
                rows={6}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                {isService ? "Photo / Evidence" : "Evidence / Media Attachments"} <span className="text-foreground/40 font-normal">(optional)</span>
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
                  <p className="text-sm font-semibold">Click to upload evidence</p>
                  <p className="text-xs text-foreground/50 mt-1">Photos or documents (JPG, PNG, PDF up to 5MB, max 5 files)</p>
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

            {isService && (
              <label className="flex items-center gap-2 text-xs font-sans text-foreground/70">
                <input type="checkbox" name="is_anonymous" className="rounded border-border" />
                Submit this report anonymously (your name won&apos;t be shown to barangay staff)
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-white rounded-lg py-3 text-sm font-sans font-bold shadow-[0_4px_14px_-4px_rgba(0,177,94,0.55)] hover:brightness-105 active:brightness-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Submitting...
                </>
              ) : isService ? "Submit Report" : "File Complaint"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          {isService ? (
            <div className="bryl-card-faint p-6 space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2">
                <Info className="h-4.5 w-4.5 text-primary" /> What Happens Next
              </h3>
              <ul className="space-y-3 text-xs text-foreground/75 font-sans leading-relaxed">
                <li>
                  <strong>Review:</strong> The Barangay Secretary reviews and classifies your report.
                </li>
                <li>
                  <strong>Assignment:</strong> It&apos;s assigned to the appropriate barangay personnel for action.
                </li>
                <li>
                  <strong>Updates:</strong> You&apos;ll be notified as the status changes, until it&apos;s resolved and closed.
                </li>
              </ul>
            </div>
          ) : (
            <div className="bryl-card-faint p-6 space-y-4">
              <h3 className="font-display text-base font-semibold flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-4.5 w-4.5" /> Mediation Rules
              </h3>
              <ul className="space-y-3 text-xs text-foreground/75 font-sans leading-relaxed">
                <li>
                  <strong>Review First:</strong> The Barangay Secretary records your complaint; the Barangay Captain determines the appropriate process — not every complaint requires mediation.
                </li>
                <li>
                  <strong>Lupon Tagapamayapa:</strong> If applicable, both parties will be notified of any scheduled conciliation proceedings.
                </li>
                <li>
                  <strong>Privacy:</strong> Your identity and uploaded files are encrypted in transit and at rest, and handled in accordance with the Data Privacy Act (RA 10173).
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
