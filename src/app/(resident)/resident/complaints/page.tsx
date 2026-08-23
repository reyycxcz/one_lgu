import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { Plus, AlertOctagon, Wrench, Clock, ChevronRight } from "lucide-react";

export default async function ResidentComplaintsPage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: complaints } = await supabase
    .from("complaints")
    .select("id, subject, respondent_name, status, record_type, created_at")
    .eq("complainant_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 animate-stagger-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-foreground">Reports & Complaints</h1>
          <p className="text-sm text-foreground/55 mt-1">Submit community reports or formal complaints, and track their status.</p>
        </div>
        <Link href="/resident/complaints/new" className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-lg font-sans text-xs font-bold hover:bg-primary/90 transition-colors self-start">
          <Plus className="h-3.5 w-3.5" /> New Report / Complaint
        </Link>
      </div>

      <div className="border border-border rounded-2xl bg-white divide-y divide-border">
        {complaints && complaints.length > 0 ? (
          complaints.map((complaint) => (
            <Link
              key={complaint.id}
              href={`/resident/complaints/${complaint.id}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${complaint.record_type === "formal_complaint" ? "bg-orange-50" : "bg-blue-50"}`}>
                  {complaint.record_type === "formal_complaint" ? (
                    <AlertOctagon className="h-4 w-4 text-orange-500" />
                  ) : (
                    <Wrench className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{complaint.subject}</p>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-muted text-foreground/50 shrink-0">
                      {complaint.record_type === "formal_complaint" ? "Complaint" : "Report"}
                    </span>
                  </div>
                  {complaint.respondent_name && (
                    <p className="text-xs text-foreground/45 mt-0.5 truncate">Respondent: {complaint.respondent_name}</p>
                  )}
                  <div className="flex items-center gap-1 text-[11px] text-foreground/40 mt-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(complaint.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`text-[11px] font-medium capitalize px-2.5 py-1 rounded-full whitespace-nowrap ${
                  complaint.status === "submitted" ? "bg-yellow-50 text-yellow-700" :
                  complaint.status === "under_review" ? "bg-blue-50 text-blue-700" :
                  complaint.status === "resolved" ? "bg-green-50 text-green-700" :
                  "bg-muted text-foreground/60"
                }`}>
                  {complaint.status.replace(/_/g, " ")}
                </span>
                <ChevronRight className="h-4 w-4 text-foreground/30" />
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-foreground/50">Nothing submitted yet.</p>
            <Link href="/resident/complaints/new" className="text-xs text-primary font-medium hover:underline mt-2 inline-block">Submit a report or complaint</Link>
          </div>
        )}
      </div>
    </div>
  );
}
