import Link from "next/link";
import { FolderOpen, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const REQUIRED_DOCS = [
  {
    id: "DOC-201",
    title: "Annual Investment Program (AIP)",
    status: "compliant",
    deadline: "Dec 31, 2026",
    code: "AIP-2026",
  },
  {
    id: "DOC-202",
    title: "Barangay Development Plan (BDP)",
    status: "pending",
    deadline: "Aug 15, 2026",
    code: "BDP-3YR",
  },
  {
    id: "DOC-203",
    title: "Gender and Development (GAD) Plan",
    status: "compliant",
    deadline: "Oct 30, 2026",
    code: "GAD-2026",
  },
];

export default function BarangayDocumentsPage() {
  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">LGU Required Documents</h1>
        <p className="text-sm text-foreground/60 mt-1">Checklist of annual planning and developmental frameworks mandated by municipal code.</p>
      </div>

      {/* Docs Grid */}
      <div className="space-y-4">
        {REQUIRED_DOCS.map((doc) => (
          <div key={doc.id} className="bryl-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0">
                <FolderOpen className="h-5 w-5 text-foreground/70" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[10px] text-foreground/40 font-semibold">{doc.code}</span>
                  <span className="font-mono text-[9px] text-foreground/30 font-semibold">#{doc.id}</span>
                </div>
                <h3 className="font-sans font-semibold text-base text-foreground">{doc.title}</h3>
                <p className="text-xs text-foreground/50">Submission deadline: {doc.deadline}</p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
              <div className="flex items-center gap-2">
                {doc.status === "compliant" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary-foreground border border-primary/30 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-foreground" /> COMPLIANT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 border border-red-100 text-[10px] font-mono font-bold tracking-wider uppercase rounded-full">
                    <AlertTriangle className="h-3 w-3 text-red-600" /> PENDING FILE
                  </span>
                )}
              </div>
              <Link
                href={`/barangay/documents/${doc.id}`}
                className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-wider text-foreground hover:underline"
              >
                Upload File <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

