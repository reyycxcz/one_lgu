import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

const REPORT_TYPE_COLORS: Record<string, string> = {
  accomplishment: "bg-[#C7FFCF] text-[#2D2A32]",
  financial: "bg-blue-100 text-blue-800",
  monthly: "bg-purple-100 text-purple-800",
  compliance: "bg-orange-100 text-orange-800",
};

export default async function BarangayReportsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("submitted_by", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-stagger-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Submit Reports</h1>
          <p className="text-sm text-foreground/60 mt-1">Submit reports and track review decisions from the municipal office.</p>
        </div>
        <Link
          href="/barangay/reports/new"
          className="px-4 py-2 bg-primary text-white hover:bg-primary/95 rounded-full font-sans text-xs font-bold flex items-center gap-1.5 transition-all"
        >
          <Plus className="h-4 w-4" /> Submit New Report
        </Link>
      </div>

      <div className="space-y-4">
        {!reports || reports.length === 0 ? (
          <div className="text-center py-16 text-foreground/40">
            <FileText className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-sans">No reports submitted yet.</p>
          </div>
        ) : (
          reports.map((report) => (
            <Link
              key={report.id}
              href={`/barangay/reports/${report.id}`}
              className="block bg-white border border-border p-6 rounded-xl hover:bg-muted/20 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted/20 border border-border flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-foreground/75" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${REPORT_TYPE_COLORS[report.type] || "bg-slate-100 text-slate-700"}`}>
                        {report.type}
                      </span>
                    </div>
                    <h3 className="font-sans font-semibold text-base text-foreground">{report.title}</h3>
                    {report.period_start && report.period_end && (
                      <p className="text-xs text-foreground/50">Period: {report.period_start} to {report.period_end}</p>
                    )}
                    {report.file_name && (
                      <p className="text-[11px] text-foreground/40 font-mono pt-1">{report.file_name}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-[9px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                    report.status === "approved" ? "bg-green-50 text-green-700" :
                    report.status === "rejected" ? "bg-red-50 text-red-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>
                    {report.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
