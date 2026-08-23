import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { DocumentRequestsCard } from "@/components/barangay/document-requests-card";
import Link from "next/link";
import { FileText } from "lucide-react";

const REPORT_TYPE_COLORS: Record<string, string> = {
  accomplishment: "bg-[#C7FFCF] text-[#2D2A32]",
  financial: "bg-blue-100 text-blue-800",
  monthly: "bg-purple-100 text-purple-800",
  compliance: "bg-orange-100 text-orange-800",
};

export default async function BarangayReportsPage() {
  const profile = await requireBarangaySection("reports");
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("submitted_by", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Reports</h1>
        <p className="text-sm text-foreground/60 mt-1">Respond to document requests from LGU departments below, and track review decisions here.</p>
      </div>

      <DocumentRequestsCard barangayId={profile.barangay_id} />

      {reports && reports.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-sans font-semibold text-sm text-foreground/70 uppercase tracking-wide">Past Submissions</h2>
          {reports.map((report) => (
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
                      <p className="text-[11px] text-foreground/40 font-sans pt-1">{report.file_name}</p>
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
          ))}
        </div>
      )}
    </div>
  );
}
