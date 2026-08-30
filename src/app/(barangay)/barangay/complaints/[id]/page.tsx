import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Image as ImageIcon, Paperclip, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { complaintTypeLabel } from "@/lib/complaints/taxonomy";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl } from "@/lib/storage/file-url";

interface ComplaintAttachment {
  type?: string;
  file_url?: string;
  name?: string;
  uploaded_at?: string;
}

export default async function BarangayComplaintDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireBarangaySection("complaints");
  const supabase = await createClient();

  const { data: complaint } = await supabase
    .from("complaints")
    .select("*, profiles!complaints_complainant_id_fkey(full_name, email, phone)")
    .eq("id", id)
    .eq("barangay_id", profile.barangay_id || "")
    .eq("record_type", "formal_complaint")
    .single();

  if (!complaint) notFound();

  const complainant = complaint.profiles as unknown as { full_name: string; email: string; phone: string } | null;
  const attachments = (complaint.attachments as unknown as ComplaintAttachment[]) || [];

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
        <Link href="/barangay/complaints" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Complaints
        </Link>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">
          BC-{id.slice(0, 8).toUpperCase()}
        </h1>
        <p className="text-sm text-foreground/60 mt-1">Formal complaint / dispute — review notices, mediation, and settlement.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bryl-card p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Subject</p>
                <p className="font-semibold text-foreground">{complaint.subject}</p>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Complainant</p>
                <p className="text-sm font-medium text-foreground">{complainant?.full_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-sm font-medium text-foreground capitalize">{complaintTypeLabel(complaint.type)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Respondent</p>
                <p className="text-sm font-medium text-foreground">{complaint.respondent_name || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Filed</p>
                <p className="text-sm font-medium text-foreground">
                  {new Date(complaint.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">Complaint Details</p>
              <p className="text-sm text-foreground">{complaint.description}</p>
            </div>

            {complaint.notice_details && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Notice / Summons</p>
                <p className="text-sm text-foreground">{complaint.notice_details}</p>
                {complaint.notice_issued_at && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Issued {new Date(complaint.notice_issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                )}
              </div>
            )}

            {complaint.scheduled_date && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Mediation Hearing Date</p>
                <p className="text-sm text-foreground font-semibold text-emerald-800">
                  {new Date(complaint.scheduled_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}

            {complaint.mediation_notes && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Mediation Notes</p>
                <p className="text-sm text-foreground">{complaint.mediation_notes}</p>
              </div>
            )}

            {(complaint.pangkat_members || complaint.pangkat_notes) && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Pangkat Conciliation</p>
                {complaint.pangkat_members && <p className="text-sm text-foreground">Members: {complaint.pangkat_members}</p>}
                {complaint.pangkat_notes && <p className="text-sm text-foreground mt-1">{complaint.pangkat_notes}</p>}
              </div>
            )}

            {complaint.resolution && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Settlement / Resolution</p>
                <p className="text-sm text-foreground font-medium">{complaint.resolution}</p>
              </div>
            )}

            {complaint.rejected_reason && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700 font-medium">{complaint.rejected_reason}</p>
              </div>
            )}

            <div className="pt-4 border-t border-border flex justify-end">
              <RowActions id={complaint.id} kind="complaint" status={complaint.status} recordType={complaint.record_type} />
            </div>
          </div>

          {/* Evidence / Attachments */}
          {attachments.length > 0 && (
            <div className="bryl-card p-6 space-y-4">
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
        </div>

        <div>
          <StatusTimeline
            currentStatus={complaint.status}
            kind="formal_complaint"
            metadata={{
              createdAt: complaint.created_at,
              noticeIssuedAt: complaint.notice_issued_at,
              noticeDetails: complaint.notice_details,
              scheduledDate: complaint.scheduled_date,
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
