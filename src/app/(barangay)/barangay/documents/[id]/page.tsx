import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default function DocumentDetailPage({ params }: { params: { id: string } }) {
  const docDetails = {
    id: params.id,
    title: "Barangay Development Plan (BDP)",
    deadline: "Aug 15, 2026",
    code: "BDP-3YR",
    status: "pending",
  };

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/barangay/documents" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Checklist
        </Link>
        <span className="micro-label">03 — COMPLIANCE ASSIGNMENT</span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <h1 className="font-pixel text-4xl uppercase tracking-wider">{docDetails.title}</h1>
          <span className="font-mono text-sm text-foreground/40">#{docDetails.id}</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload card */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <div className="border-b border-border/60 pb-4">
            <span className="micro-label">REQUIREMENTS DEADLINE</span>
            <p className="text-sm font-semibold text-foreground/80 mt-1">{docDetails.deadline}</p>
          </div>

          <form className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Upload Compliance File
              </label>
              <div className="border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Upload className="h-5 w-5 text-foreground/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Click to upload official BDP template</p>
                  <p className="text-xs text-foreground/50 mt-1">Upload PDF format up to 20MB (signed by council members)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full green-chip py-3 justify-center text-xs tracking-widest font-bold font-mono"
            >
              DISPATCH COMPLIANCE FILE TO LGU STORAGE
            </button>
          </form>
        </div>

        {/* Regulatory instruction sidebar */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4 text-xs font-sans leading-relaxed text-foreground/80">
            <h4 className="font-pixel text-base uppercase tracking-wider text-foreground">GUIDELINES</h4>
            <p>
              The <strong>3-Year Barangay Development Plan (BDP)</strong> outlines the programs, projects, and activities designed to meet developmental milestones.
            </p>
            <p>
              Failure to submit approved planning frameworks by the deadline suspends access to the municipal development funds under Layer 5 RLS policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
