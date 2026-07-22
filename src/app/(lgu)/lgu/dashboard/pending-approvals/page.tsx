import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

export default async function PendingApprovalsPage() {
  const supabase = await createClient();

  const [{ data: reports }, { data: certs }, { data: complaints }] = await Promise.all([
    supabase
      .from("reports")
      .select("id, title, status, created_at, barangays(name)")
      .in("status", ["submitted", "under_review"]),
    supabase
      .from("certification_requests")
      .select("id, type, status, created_at, barangays(name)")
      .in("status", ["submitted", "verified"]),
    supabase
      .from("complaints")
      .select("id, subject, status, created_at, barangays(name)")
      .eq("status", "submitted"),
  ]);

  type Item = { id: string; kind: string; title: string; status: string; created_at: string; barangay: string };
  const items: Item[] = [
    ...(reports || []).map((r) => ({
      id: r.id,
      kind: "Report",
      title: r.title,
      status: r.status,
      created_at: r.created_at,
      barangay: (r.barangays as unknown as { name: string } | null)?.name || "—",
    })),
    ...(certs || []).map((c) => ({
      id: c.id,
      kind: "Certification",
      title: c.type.replace(/_/g, " "),
      status: c.status,
      created_at: c.created_at,
      barangay: (c.barangays as unknown as { name: string } | null)?.name || "—",
    })),
    ...(complaints || []).map((c) => ({
      id: c.id,
      kind: "Complaint",
      title: c.subject,
      status: c.status,
      created_at: c.created_at,
      barangay: (c.barangays as unknown as { name: string } | null)?.name || "—",
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const rows = items.map((r) => [
    <Badge key="kind" variant="outline">{r.kind}</Badge>,
    <span key="title" className="font-medium capitalize">{r.title}</span>,
    <span key="barangay" className="text-muted-foreground">{r.barangay}</span>,
    <span key="date" className="text-muted-foreground">
      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
    </span>,
    <StatusBadge key="status" status={r.status} />,
  ]);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Pending Approvals"
        description="Items across reports, certifications, and complaints awaiting LGU action."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Type" },
              { label: "Title" },
              { label: "Barangay" },
              { label: "Date" },
              { label: "Status", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<ClipboardCheck />}
            emptyMessage="Nothing pending approval right now."
          />
        </CardContent>
      </Card>
    </div>
  );
}
