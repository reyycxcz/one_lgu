import Link from "next/link";
import { ArrowLeft, Paperclip, FileText, Image as ImageIcon, ExternalLink, Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";
import { complaintTypeLabel, STATUS_LABELS, type ComplaintStatus } from "@/lib/complaints/taxonomy";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl, getFileDownloadUrl } from "@/lib/storage/file-url";

interface ComplaintAttachment {
  type?: string;
  file_url?: string;
  name?: string;
  uploaded_at?: string;
}

export default async function ComplaintDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireSession();
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select("*")
    .eq("id", id)
    .eq("complainant_id", session.user.id)
    .single();

  if (!complaint) {
    return (
      <div className="space-y-8 animate-stagger-in">
        <div>
          <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to List
          </Link>
          <h1 className="font-sans text-2xl font-bold text-foreground">Not Found</h1>
          <p className="text-sm text-foreground/55 mt-1">This record does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

  const isService = complaint.record_type === "service_report";
  const attachments = (complaint.attachments as unknown as ComplaintAttachment[]) || [];

  // audit_logs RLS only allows super_admin/barangay_official — ownership of
  // this specific complaint was already verified above via the RLS-scoped
  // query, so it's safe to use the admin client for just this read.
  const admin = createAdminClient();
  const { data: auditEntries } = await admin
    .from("audit_logs")
    .select("action, created_at, metadata")
    .eq("entity_type", "complaint")
    .eq("entity_id", id)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/resident/complaints" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to List
        </Link>
        <h1 className="font-sans text-2xl font-bold text-foreground">{isService ? "Community Report" : "Complaint Details"}</h1>
        <p className="text-sm text-foreground/55 mt-1">
          {isService ? "BR" : "BC"}-{complaint.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Subject</p>
              <h3 className="text-lg font-semibold text-foreground">{complaint.subject}</h3>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Category</p>
              <p className="text-sm text-foreground/75 capitalize">{complaintTypeLabel(complaint.type)}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Description</p>
              <p className="text-sm text-foreground/75 leading-relaxed">{complaint.description}</p>
            </div>
            {!isService && complaint.respondent_name && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Respondent</p>
                <p className="text-sm text-foreground/75">{complaint.respondent_name}</p>
              </div>
            )}
            {isService && complaint.location && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Location</p>
                <p className="text-sm text-foreground/75">{complaint.location}</p>
              </div>
            )}
            {isService && complaint.assigned_to_label && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Assigned To</p>
                <p className="text-sm text-foreground/75">{complaint.assigned_to_label}</p>
              </div>
            )}
            {!isService && complaint.scheduled_date && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">Mediation Hearing Date</p>
                <p className="text-sm text-foreground/75 font-semibold text-emerald-800">
                  {new Date(complaint.scheduled_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
            {complaint.resolution && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-xs font-bold text-emerald-800 mb-0.5">{isService ? "Resolution" : "Settlement"}</p>
                <p className="text-xs text-emerald-900">{complaint.resolution}</p>
              </div>
            )}
            {complaint.rejected_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-bold text-red-800 mb-0.5">Rejection Reason</p>
                <p className="text-xs text-red-700">{complaint.rejected_reason}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Current Status</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {STATUS_LABELS[complaint.status as ComplaintStatus] || complaint.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>

          {/* Evidence / Attachments */}
          {attachments.length > 0 && (
            <div className="bg-white border border-border p-6 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h4 className="font-sans text-sm font-bold text-foreground">Evidence & Attachments</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {attachments.map((att, i) => {
                  const fileUrl = att.file_url || "";
                  const isImage = att.type === "image" || fileUrl.match(/\.(jpeg|jpg|png|webp)/i);
                  const fileName = att.name || (isImage ? `Photo_${i + 1}.jpg` : `Evidence_${i + 1}.pdf`);
                  const viewUrl = getFileViewUrl(fileUrl, fileName);

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border/70 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
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
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-primary text-white hover:bg-primary/90 text-[11px] font-bold shrink-0 transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" /> View
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <StatusTimeline
            currentStatus={complaint.status}
            kind={isService ? "service_report" : "formal_complaint"}
            metadata={{
              createdAt: complaint.created_at,
              assignedAt: complaint.assigned_at,
              assignedToLabel: complaint.assigned_to_label,
              scheduledDate: complaint.scheduled_date,
              noticeIssuedAt: complaint.notice_issued_at,
              noticeDetails: complaint.notice_details,
              resolvedAt: complaint.resolved_at,
              resolution: complaint.resolution,
              closedAt: complaint.closed_at,
              rejectedReason: complaint.rejected_reason,
            }}
            auditLogs={auditEntries || []}
          />
        </div>
      </div>
    </div>
  );
}
