import Link from "next/link";
import { ArrowLeft, Upload, ShieldAlert } from "lucide-react";

export default function NewComplaintPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to List
        </Link>
        <span className="micro-label">03 — FILE COMPLAINT</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">File Incident Complaint</h1>
        <p className="text-sm text-foreground/60 mt-1">Describe the incident details and attach evidence (photos, video clips, or docs).</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Incident Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Subject / Incident Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Boundary Fence Dispute, Noise Disturbance..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Respondent / Involved Party
                </label>
                <input
                  type="text"
                  placeholder="e.g. Full name or property address..."
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Detailed Incident Description
              </label>
              <textarea
                placeholder="Provide a detailed timeline of events, including dates, times, and exact details of the incident..."
                rows={6}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
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
              className="w-full green-chip py-3 justify-center text-xs tracking-widest font-bold font-mono"
            >
              FILE COMPLAINT & ENTER REGISTRY
            </button>
          </form>
        </div>

        {/* Regulatory mediation warnings */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h3 className="font-pixel text-lg uppercase tracking-wider flex items-center gap-2 text-destructive">
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
