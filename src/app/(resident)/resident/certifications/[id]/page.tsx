import Link from "next/link";
import QRCode from "qrcode";
import { ArrowLeft, FileText, Download, ExternalLink, Paperclip } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { StatusTimeline } from "@/components/shared/status-timeline";
import { getFileViewUrl, getFileDownloadUrl } from "@/lib/storage/file-url";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://one-lgu.vercel.app";

interface RequirementAttachment {
  name?: string;
  file_url?: string;
  url?: string;
  uploaded_at?: string;
}

export default async function CertificationDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: cert } = await supabase
    .from("certification_requests")
    .select("*")
    .eq("id", params.id)
    .eq("requester_id", session.user.id)
    .single();

  if (!cert) {
    return (
      <div className="space-y-8 animate-stagger-in">
        <div>
          <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Certifications
          </Link>
          <h1 className="font-sans text-2xl font-bold text-foreground">Certification Not Found</h1>
          <p className="text-sm text-foreground/55 mt-1">This request does not exist or you do not have access.</p>
        </div>
      </div>
    );
  }

  const verifyUrl = `${SITE_URL}/verify/${cert.id}`;
  const qrDataUrl = cert.status === "released" ? await QRCode.toDataURL(verifyUrl, { margin: 1, width: 160 }) : null;
  const requirements = (cert.requirements as unknown as RequirementAttachment[]) || [];

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <Link href="/resident/certifications" className="inline-flex items-center gap-1.5 text-xs font-sans font-medium text-foreground/45 hover:text-foreground/70 transition-colors mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Certifications
        </Link>
        <h1 className="font-sans text-2xl font-bold text-foreground">Certification Request</h1>
        <p className="text-sm text-foreground/55 mt-1">Request #{cert.id.slice(0, 8)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Document Type</p>
              <h3 className="text-lg font-semibold text-foreground capitalize">{cert.type.replace(/_/g, " ")}</h3>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Purpose</p>
              <p className="text-sm text-foreground/75">{cert.purpose}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Current Status</p>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {cert.status.replace(/_/g, " ")}
              </span>
            </div>
            {cert.rejected_reason && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs font-bold text-red-800 mb-0.5">Rejection Reason</p>
                <p className="text-xs text-red-700">{cert.rejected_reason}</p>
              </div>
            )}
          </div>

          {/* Submitted Requirements / Attachments */}
          {requirements.length > 0 && (
            <div className="bg-white border border-border p-6 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-primary" />
                <h4 className="font-sans text-sm font-bold text-foreground">Submitted Requirement Files</h4>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {requirements.map((req, i) => {
                  const fileUrl = req.file_url || req.url || "";
                  const fileName = req.name || `Requirement_${i + 1}.pdf`;
                  const viewUrl = getFileViewUrl(fileUrl, fileName);

                  return (
                    <div
                      key={i}
                      className="p-3 rounded-lg border border-border/70 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
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
            currentStatus={cert.status}
            kind="certification"
            metadata={{
              createdAt: cert.created_at,
              verifiedAt: cert.verified_at,
              approvedAt: cert.approved_at,
              releasedAt: cert.released_at,
              rejectedReason: cert.rejected_reason,
            }}
          />

          {qrDataUrl && (
            <div className="bg-white border border-border p-6 rounded-xl space-y-3 text-center">
              <h4 className="font-sans text-sm font-bold text-foreground">Verify Authenticity</h4>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="QR code to verify this certificate" className="mx-auto h-32 w-32 rounded-lg border border-border" />
              <p className="text-[11px] text-foreground/55 leading-relaxed">
                Scan to confirm this certificate is genuine, or share this link:{" "}
                <a href={verifyUrl} className="text-primary font-medium break-all hover:underline">{verifyUrl}</a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
