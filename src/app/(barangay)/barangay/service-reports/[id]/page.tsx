import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { complaintTypeLabel, PRIORITY_LABELS } from "@/lib/complaints/taxonomy";

interface Attachment {
  type: string;
  file_url: string;
  uploaded_at: string;
}

export default async function ServiceReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("service_reports");
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("complaints")
    .select("*, profiles!complaints_complainant_id_fkey(full_name, email, phone)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "service_report")
    .single();

  if (!report) notFound();

  const reporter = report.profiles as unknown as { full_name: string; email: string; phone: string } | null;
  const attachments = (report.attachments as unknown as Attachment[]) || [];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/barangay/service-reports" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Community Reports
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">
          BR-{id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">Community / service report — administrative processing only, no mediation.</p>
      </div>

      <div className="bryl-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Subject</p>
            <p className="font-semibold text-foreground">{report.subject}</p>
          </div>
          <StatusBadge status={report.status} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Reporter</p>
            <p className="text-sm font-medium text-foreground">{report.is_anonymous ? "Anonymous" : (reporter?.full_name || "—")}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Category</p>
            <p className="text-sm font-medium text-foreground capitalize">{complaintTypeLabel(report.type)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Location</p>
            <p className="text-sm font-medium text-foreground">{report.location || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Priority</p>
            <p className="text-sm font-medium text-foreground capitalize">{PRIORITY_LABELS[report.priority] || report.priority}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Reported</p>
            <p className="text-sm font-medium text-foreground">
              {new Date(report.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          {report.incident_at && (
            <div>
              <p className="text-xs text-muted-foreground">Incident Date/Time</p>
              <p className="text-sm font-medium text-foreground">
                {new Date(report.incident_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-1">Description</p>
          <p className="text-sm text-foreground">{report.description}</p>
        </div>

        {attachments.length > 0 && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Photo / Evidence</p>
            <div className="flex flex-wrap gap-2">
              {attachments.map((a, i) => (
                <a
                  key={i}
                  href={a.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-secondary/40 text-xs font-medium hover:bg-secondary/70"
                >
                  <Download className="h-3.5 w-3.5" /> Attachment {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}

        {report.assigned_to_label && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
            <p className="text-sm text-foreground">{report.assigned_to_label}</p>
            {report.assigned_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Assigned {new Date(report.assigned_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
        )}

        {report.rejected_reason && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
            <p className="text-sm text-red-700">{report.rejected_reason}</p>
          </div>
        )}

        {report.resolution && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Resolution</p>
            <p className="text-sm text-foreground">{report.resolution}</p>
          </div>
        )}

        <div className="pt-4 border-t border-border flex justify-end">
          <RowActions id={report.id} kind="complaint" status={report.status} recordType={report.record_type} />
        </div>
      </div>
    </div>
  );
}
