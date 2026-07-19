import Link from "next/link";
import { ArrowLeft, Upload, Info } from "lucide-react";

export default function NewReportPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/barangay/reports" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">Submit Accomplishments</h1>
        <p className="text-sm text-foreground/60 mt-1">Submit mandatory operational files to the LGU consol.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <form className="space-y-6">
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Report Title
              </label>
              <input
                type="text"
                placeholder="e.g. Q3 Financial Expense Breakdown, July Accomplishment Report..."
                className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                required
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Report Type
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>Select type...</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="financial">Financial Report</option>
                  <option value="accomplishment">Accomplishment Report</option>
                  <option value="compliance">Compliance Report</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Period Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Period End Date
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                Report File Document
              </label>
              <div className="border border-dashed border-border rounded-xl p-8 bg-muted/10 flex flex-col items-center justify-center text-center space-y-3 hover:bg-muted/20 transition-all cursor-pointer">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                  <Upload className="h-5 w-5 text-foreground/80" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Click to upload report document</p>
                  <p className="text-xs text-foreground/50 mt-1">Upload PDF or Spreadsheet (Excel/CSV up to 10MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full green-chip py-3 justify-center text-xs tracking-widest font-bold font-mono"
            >
              DISPATCH REPORT TO LGU REVIEWERS
            </button>
          </form>
        </div>

        {/* Informational Sidebar */}
        <div className="space-y-6">
          <div className="bryl-card-faint p-6 space-y-4">
            <h3 className="font-sans text-lg uppercase tracking-wider flex items-center gap-2">
              <Info className="h-4.5 w-4.5" /> LGU Deadlines
            </h3>
            <ul className="space-y-3 text-xs text-foreground/75 font-sans leading-relaxed">
              <li>
                <strong>Monthly Accomplishment:</strong> Due every 5th day of the succeeding month.
              </li>
              <li>
                <strong>Financial Expense Ledger:</strong> Due every 10th day of the succeeding month.
              </li>
              <li>
                <strong>Compliance Checkpoints:</strong> Tracked on L4 validations, late submissions lower the barangay standing score.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

