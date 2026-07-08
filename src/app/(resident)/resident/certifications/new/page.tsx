import Link from "next/link";
import { ArrowLeft, Upload, Info } from "lucide-react";

export default function NewCertificationPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <span className="micro-label">02 — NEW REQUEST</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Request Certificate</h1>
        <p className="text-sm text-foreground/60 mt-1">Fill out the required information and upload attachments.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Request Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <form className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Certificate Type
              </label>
              <select
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
                defaultValue=""
              >
                <option value="" disabled>Select certificate type...</option>
                <option value="barangay_clearance">Barangay Clearance</option>
                <option value="certificate_of_residency">Certificate of Residency</option>
                <option value="certificate_of_indigency">Certificate of Indigency</option>
                <option value="business_clearance">Business Clearance</option>
                <option value="first_time_job_seeker">First-Time Job Seeker (RA 11261)</option>
              </select>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Purpose
              </label>
              <textarea
                placeholder="Describe why you are requesting this certificate (e.g. Local employment requirements, Scholarship application, bank requirements, business permit application)..."
                rows={4}
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Requirements Upload
              </label>
              <div className="border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Upload className="h-5 w-5 text-foreground/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Click to upload or drag & drop files</p>
                  <p className="text-xs text-foreground/50 mt-1">Upload valid ID or residency proofs (PDF, JPG, PNG up to 5MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full green-chip py-3 justify-center text-xs tracking-widest font-bold font-mono"
            >
              SUBMIT CERTIFICATE REQUEST
            </button>
          </form>
        </div>

        {/* Informational sidebar */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h3 className="font-pixel text-lg uppercase tracking-wider flex items-center gap-2">
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
