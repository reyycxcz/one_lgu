import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Image as ImageIcon, Paperclip, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { complaintTypeLabel, PRIORITY_LABELS } from "@/lib/complaints/taxonomy";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl } from "@/lib/storage/file-url";

interface Attachment {
  type?: string;
  file_url?: string;
  name?: string;
  uploaded_at?: string;
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

  const admin = createAdminClient();
  const { data: auditEntries } = await admin
    .from("audit_logs")
    .select("action, created_at, metadata")
    .eq("entity_type", "complaint")
    .eq("entity_id", id)
    .order("created_at", { ascending: true });

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

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
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
                <div className="grid sm:grid-cols-2 gap-2">
                  {attachments.map((a, i) => {
                    const fileUrl = a.file_url || "";
                    const isImage = a.type === "image" || fileUrl.match(/\.(jpeg|jpg|png|webp)/i);
                    const fileName = a.name || (isImage ? `Photo_${i + 1}.jpg` : `Attachment_${i + 1}.pdf`);
                    const viewUrl = getFileViewUrl(fileUrl, fileName);

                    return (
                      <div
                        key={i}
                        className="p-3 rounded-lg border border-border bg-slate-50 flex items-center justify-between gap-3 text-xs shadow-2xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isImage ? (
                            <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                          )}
                          <span className="truncate font-medium text-foreground">{fileName}</span>
                        </div>
                        {fileUrl && (
                          <a
                            href={viewUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-white hover:bg-primary/90 text-xs font-bold shrink-0 transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> View
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {report.assigned_to_label && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                <p className="text-sm text-foreground font-medium">{report.assigned_to_label}</p>
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
                <p className="text-sm text-red-700 font-medium">{report.rejected_reason}</p>
              </div>
            )}

            {report.resolution && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Resolution</p>
                <p className="text-sm text-foreground font-medium">{report.resolution}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <RowActions id={report.id} kind="complaint" status={report.status} recordType={report.record_type} />
            </div>
          </div>
        </div>

        <div>
          <StatusTimeline
            currentStatus={report.status}
            kind="service_report"
            metadata={{
              createdAt: report.created_at,
              assignedAt: report.assigned_at,
              assignedToLabel: report.assigned_to_label,
              resolvedAt: report.resolved_at,
              resolution: report.resolution,
              closedAt: report.closed_at,
              rejectedReason: report.rejected_reason,
            }}
            auditLogs={auditEntries || []}
          />
        </div>
      </div>
    </div>
  );
}
