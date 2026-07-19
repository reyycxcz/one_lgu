"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload, ShieldAlert, Loader2 } from "lucide-react";
import { submitComplaint } from "@/actions/complaints";

export default function NewComplaintPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("attachments", "[]");

    const result = await submitComplaint(formData);

    if (result?.error) {
      setError(typeof result.error === "string" ? result.error : "Failed to file complaint. Please check the form and try again.");
      setLoading(false);
      return;
    }

    router.push("/resident/complaints");
  }

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 font-sans text-xs font-medium text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
        <h1 className="font-display font-bold text-3xl text-foreground">File Incident Complaint</h1>
        <p className="text-sm text-foreground/60 mt-1">Describe the incident details and attach evidence (photos, video clips, or docs).</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Incident Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          {error && (
            <div className="p-3 rounded-xl text-sm font-sans bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Complaint Category
              </label>
              <select
                name="type"
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
                defaultValue=""
              >
                <option value="" disabled>Select complaint category...</option>
                <option value="noise_complaint">Noise Complaint</option>
                <option value="garbage_illegal_dumping">Garbage / Illegal Dumping</option>
                <option value="road_infrastructure">Road or Infrastructure</option>
                <option value="streetlight_problem">Streetlight Problem</option>
                <option value="stray_aggressive_animals">Stray or Aggressive Animals</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                  Subject / Incident Type
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="e.g. Boundary Fence Dispute, Noise Disturbance..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                  Respondent / Involved Party
                </label>
                <input
                  type="text"
                  name="respondent_name"
                  placeholder="e.g. Full name or property address..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Detailed Incident Description
              </label>
              <textarea
                name="description"
                placeholder="Provide a detailed timeline of events, including dates, times, and exact details of the incident..."
                rows={6}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-sans text-xs font-semibold text-foreground/75 mb-2">
                Evidence / Media Attachments
              </label>
              <div className="border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Upload className="h-5 w-5 text-foreground/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Click to upload media files</p>
                  <p className="text-xs text-foreground/50 mt-1">Upload JPEG, PNG, MP4, or PDF (up to 15MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 gradient-primary text-white rounded-lg py-3 text-sm font-sans font-bold shadow-[0_4px_14px_-4px_rgba(0,177,94,0.55)] hover:brightness-105 active:brightness-95 transition-all disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Filing Complaint...
                </>
              ) : (
                "File Complaint"
              )}
            </button>
          </form>
        </div>

        {/* Regulatory mediation warnings */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h3 className="font-display text-base font-semibold flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-4.5 w-4.5" /> Mediation Rules
            </h3>
            <ul className="space-y-3 text-xs text-foreground/75 font-sans leading-relaxed">
              <li>
                <strong>Lupon Tagapamayapa:</strong> Filed complaints are evaluated by the Barangay Captain and referred to local community mediators.
              </li>
              <li>
                <strong>Mediation Schedule:</strong> If approved, both complainant and respondent will receive notification of the scheduled arbitration face-to-face.
              </li>
              <li>
                <strong>Privacy:</strong> Resident identity and uploaded files are secure and encrypted under L6 data protection policies.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
