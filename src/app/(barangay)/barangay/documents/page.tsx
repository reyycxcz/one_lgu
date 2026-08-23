import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { FolderOpen, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";

const REQUIRED_TYPES = [
  { type: "monthly", label: "Monthly Accomplishment Report" },
  { type: "financial", label: "Financial Expense Ledger" },
  { type: "accomplishment", label: "Accomplishment Report" },
  { type: "compliance", label: "Compliance / Planning Document (AIP, BDP, GAD)" },
];

export default async function BarangayDocumentsPage() {
  const profile = await requireBarangaySection("documents");
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, type, title, status, created_at")
    .eq("barangay_id", profile.barangay_id || "")
    .order("created_at", { ascending: false });

  const latestByType = new Map<string, { id: string; title: string; status: string; created_at: string }>();
  (reports || []).forEach((r) => {
    if (!latestByType.has(r.type)) latestByType.set(r.type, r);
  });

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">LGU Required Documents</h1>
        <p className="text-sm text-foreground/60 mt-1">Checklist of annual planning and developmental frameworks mandated by municipal code.</p>
      </div>

      <div className="space-y-4">
        {REQUIRED_TYPES.map(({ type, label }) => {
          const latest = latestByType.get(type);
          const compliant = !!latest && latest.status === "approved";
          return (
            <div key={type} className="bryl-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0">
                  <FolderOpen className="h-5 w-5 text-foreground/70" />
                </div>
                <div className="space-y-1">
                  <span className="font-sans text-[10px] text-foreground/40 font-semibold capitalize">{type}</span>
                  <h3 className="font-sans font-semibold text-base text-foreground">{label}</h3>
                  <p className="text-xs text-foreground/50">
                    {latest ? `Last submitted ${new Date(latest.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}` : "No submission on file"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-border/40 pt-4 sm:pt-0">
                <div className="flex items-center gap-2">
                  {compliant ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/20 text-primary-foreground border border-primary/30 text-[10px] font-sans font-bold rounded-full">
                      <CheckCircle2 className="h-3 w-3 text-foreground" /> Compliant
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-800 border border-red-100 text-[10px] font-sans font-bold rounded-full">
                      <AlertTriangle className="h-3 w-3 text-red-600" /> {latest ? "Awaiting Review" : "Missing"}
                    </span>
                  )}
                </div>
                {latest ? (
                  <Link
                    href={`/barangay/documents/${latest.id}`}
                    className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-foreground hover:underline"
                  >
                    View Submission <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <Link
                    href="/barangay/reports"
                    className="inline-flex items-center gap-1 font-sans text-[10px] font-bold text-foreground hover:underline"
                  >
                    View Requests <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
