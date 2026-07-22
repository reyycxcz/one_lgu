import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import ReportForm from "./report-form";

export default function NewReportPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <Link href="/barangay/reports" className="inline-flex items-center gap-1.5 font-sans text-xs uppercase tracking-wider text-foreground/60 hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to History
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Submit Accomplishments</h1>
        <p className="text-sm text-foreground/60 mt-1">Submit mandatory operational files to the LGU consol.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <ReportForm />
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
                <strong>Compliance Checkpoints:</strong> Submissions are reviewed by the LGU; late or missing reports lower the barangay's compliance standing.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

