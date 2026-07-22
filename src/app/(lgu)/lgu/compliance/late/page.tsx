import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { AlertCircle } from "lucide-react";

export default async function LateSubmissionsPage() {
  const supabase = await createClient();

  const { data: reports } = await supabase
    .from("reports")
    .select("id, title, period_end, created_at, barangays(name)")
    .not("period_end", "is", null)
    .order("created_at", { ascending: false });

  const late = (reports || []).filter(
    (r) => r.period_end && new Date(r.created_at) > new Date(r.period_end)
  );

  const rows = late.map((r) => {
    const barangay = r.barangays as unknown as { name: string } | null;
    return [
      <span key="title" className="font-medium">{r.title}</span>,
      <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
      <span key="periodEnd" className="text-muted-foreground">
        {new Date(r.period_end!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </span>,
      <span key="submitted" className="text-muted-foreground">
        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </span>,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Late Submissions"
        description="Reports submitted after their covered reporting period ended."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Report" },
              { label: "Barangay" },
              { label: "Period End" },
              { label: "Submitted", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<AlertCircle />}
            emptyMessage="No late submissions on record."
          />
        </CardContent>
      </Card>
    </div>
  );
}
