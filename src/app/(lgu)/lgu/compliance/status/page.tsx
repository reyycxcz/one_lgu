import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default async function SubmissionStatusPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: reports }] = await Promise.all([
    supabase.from("barangays").select("id, name").eq("is_active", true).order("name"),
    supabase.from("reports").select("barangay_id, created_at").order("created_at", { ascending: false }),
  ]);

  const lastSubmission = new Map<string, string>();
  (reports || []).forEach((r) => {
    if (!r.barangay_id) return;
    if (!lastSubmission.has(r.barangay_id)) lastSubmission.set(r.barangay_id, r.created_at);
  });

  const rows = (barangays || []).map((b) => {
    const last = lastSubmission.get(b.id);
    return [
      <span key="name" className="font-medium">{b.name}</span>,
      <span key="last" className="text-muted-foreground">
        {last ? new Date(last).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </span>,
      <Badge key="status" variant={last ? "default" : "outline"}>
        {last ? "Has Submitted" : "No Submissions"}
      </Badge>,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Submission Status"
        description="Most recent report submission per barangay."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Barangay" },
              { label: "Last Submission" },
              { label: "Status", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<ClipboardList />}
            emptyMessage="No barangays registered yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
