import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/auth/session";
import { complaintTypeLabel, STATUS_LABELS, type ComplaintStatus } from "@/lib/complaints/taxonomy";

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
                <p className="text-sm text-foreground/75">
                  {new Date(complaint.scheduled_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            )}
            {complaint.resolution && (
              <div>
                <p className="text-xs font-medium text-foreground/55 mb-1">{isService ? "Resolution" : "Settlement"}</p>
                <p className="text-sm text-foreground/75">{complaint.resolution}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-foreground/55 mb-1">Status</p>
              <span className="inline-block text-xs font-bold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                {STATUS_LABELS[complaint.status as ComplaintStatus] || complaint.status.replace(/_/g, " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-border p-6 rounded-xl space-y-4">
            <h4 className="font-sans text-sm font-bold text-foreground">Timeline</h4>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-2">
                <span className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Submitted</p>
                  <p className="text-foreground/50">{new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              {(auditEntries || [])
                .filter((entry) => entry.action.startsWith("complaint.") && !entry.action.includes("submitted"))
                .map((entry, i) => {
                  const status = entry.action.replace("complaint.", "") as ComplaintStatus;
                  return (
                    <div key={i} className="flex items-start gap-2">
                      <span className="h-2 w-2 rounded-full bg-slate-400 mt-1 shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">{STATUS_LABELS[status] || status.replace(/_/g, " ")}</p>
                        <p className="text-foreground/50">{new Date(entry.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
