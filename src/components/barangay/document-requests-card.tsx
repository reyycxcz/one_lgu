import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, Clock, Download, MessageSquare, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { DEPARTMENT_LABELS } from "@/lib/auth/departments";
import { getFileViewUrl } from "@/lib/storage/file-url";

/**
 * Shared between /barangay/reports and /barangay/compliance — both are
 * reasonable places a Secretary would look for incoming LGU document
 * requests, so this fetches and renders the same card in either spot
 * rather than duplicating the query/JSX.
 */
export async function DocumentRequestsCard({ barangayId }: { barangayId: string | null }) {
  const supabase = await createClient();

  const { data: rawRequests } = await supabase
    .from("request_recipients")
    .select(`
      request_id,
      document_requests (
        id,
        title,
        description,
        deadline,
        status,
        requesting_department_id,
        created_at
      )
    `)
    .eq("barangay_id", barangayId || "")
    .order("created_at", { ascending: false });

  const dbRequests = (rawRequests || [])
    .map((r: any) => r.document_requests)
    .filter((req: any) => req && req.status === "active");

  const requestIds = dbRequests.map((r: any) => r.id);

  let submissions: any[] = [];
  if (requestIds.length > 0) {
    const { data } = await supabase
      .from("document_submissions")
      .select(`
        id,
        request_id,
        file_name,
        file_url,
        status,
        remarks,
        created_at,
        captain_notes,
        submission_reviews (
          review_notes,
          created_at
        )
      `)
      .in("request_id", requestIds)
      .eq("barangay_id", barangayId || "");
    submissions = data || [];
  }

  const submissionsMap = new Map();
  submissions.forEach((sub) => {
    const reviews = sub.submission_reviews || [];
    const sortedReviews = [...reviews].sort(
      (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const latestReview = sortedReviews[0] || null;

    submissionsMap.set(sub.request_id, {
      ...sub,
      latestReviewNotes: latestReview?.review_notes || null,
    });
  });

  return (
    <Card className="border border-border/60 shadow-xs">
      <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm font-bold">Active LGU Document Requests</CardTitle>
          <p className="text-[11px] text-muted-foreground mt-0.5">Submissions specifically requested by Municipal Departments</p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {dbRequests.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2.5" />
            <p className="text-xs font-bold text-foreground">All clear!</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">No active document requests pending from LGU offices.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dbRequests.map((req: any) => {
              const sub = submissionsMap.get(req.id);
              const departmentLabel = req.requesting_department_id
                ? (DEPARTMENT_LABELS[req.requesting_department_id as keyof typeof DEPARTMENT_LABELS] || req.requesting_department_id)
                : "LGU Department";

              const isReturned = sub && ["returned", "resubmission_required"].includes(sub.status);
              const isPendingCaptain = sub && sub.status === "pending_captain_approval";
              const returnedByCaptain = isReturned && !sub.latestReviewNotes && sub.captain_notes;

              return (
                <div key={req.id} className="flex flex-col gap-3 p-4 rounded-lg border border-border bg-slate-50/50 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        {req.title}
                      </p>
                      <span className="inline-flex text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-md font-semibold shrink-0">
                        Requested by: {departmentLabel}
                      </span>
                      {req.description && (
                        <p className="text-muted-foreground mt-1 leading-relaxed">{req.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Deadline: {new Date(req.deadline).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {sub ? (
                        <>
                          <StatusBadge status={sub.status} className="scale-90" />
                          <Button size="sm" variant="outline" asChild className="text-[11px] h-8 cursor-pointer">
                            <a href={getFileViewUrl(sub.file_url, sub.file_name)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                              <ExternalLink className="h-3.5 w-3.5" /> View Submitted
                            </a>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" asChild className="shrink-0 text-[11px] h-8 cursor-pointer">
                          <Link href={`/barangay/reports/new-response?requestId=${req.id}`}>
                            Submit Document
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>

                  {isPendingCaptain && (
                    <div className="mt-2 p-3 bg-amber-50 border border-amber-200/50 rounded-lg text-amber-800 text-[11px] flex gap-2 items-start animate-fade-in">
                      <Clock className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <p className="leading-relaxed">Sent to your Barangay Captain for approval — it will reach {departmentLabel} automatically once approved.</p>
                    </div>
                  )}

                  {isReturned && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200/50 rounded-lg text-red-800 text-[11px] flex gap-2 items-start animate-fade-in">
                      <MessageSquare className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">{returnedByCaptain ? "Your Captain's Notes:" : "LGU Review Notes:"}</p>
                        <p className="italic leading-relaxed">
                          {returnedByCaptain ? sub.captain_notes : (sub.latestReviewNotes || "Please review and resubmit your document.")}
                        </p>
                        <div className="pt-2">
                          <Button size="sm" variant="destructive" asChild className="h-7 text-[10px] bg-red-600 hover:bg-red-700 font-semibold cursor-pointer">
                            <Link href={`/barangay/reports/new-response?requestId=${req.id}`}>
                              Submit Corrected Report
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
