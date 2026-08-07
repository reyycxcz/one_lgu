import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LguPageHeader } from "@/components/lgu/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { RowActions } from "@/components/lgu/row-actions";
import { Card, CardContent } from "@/components/ui/card";
import { FilterableTable, type FilterableRow } from "@/components/lgu/filterable-table";
import { Megaphone } from "lucide-react";
import { CATEGORY_META } from "@/lib/civic-bulletin";

export async function AnnouncementList({
  title,
  description,
  statuses,
}: {
  title: string;
  description: string;
  statuses: string[];
}) {
  const supabase = await createClient();

  const { data: announcements } = await supabase
    .from("announcements")
    .select("id, slug, category, title, tag, status, published_at, created_at")
    .limit(500)
    .in("status", statuses)
    .order("published_at", { ascending: false, nullsFirst: false });

  let recipientCounts: Record<string, number> = {};
  if (announcements && announcements.length > 0) {
    const admin = createAdminClient();
    const { data: notifs } = await admin
      .from("notifications")
      .select("entity_id")
      .eq("entity_type", "announcement")
      .in("entity_id", announcements.map((a) => a.id));

    recipientCounts = (notifs || []).reduce((acc, n) => {
      acc[n.entity_id] = (acc[n.entity_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  const rows: FilterableRow[] = (announcements || []).map((a) => {
    const categoryLabel = CATEGORY_META[a.category]?.badge ?? "Announcement";
    const displayDate = a.published_at || a.created_at;

    return {
      searchText: `${a.title} ${categoryLabel} ${a.tag}`,
      cells: [
        <div key="title">
          <p className="font-medium">{a.title}</p>
          <p className="text-xs text-muted-foreground">{a.tag}</p>
        </div>,
        <span key="category" className="text-muted-foreground">{categoryLabel}</span>,
        <span key="reach" className="text-muted-foreground">{recipientCounts[a.id] || 0} residents</span>,
        <span key="date" className="text-muted-foreground">
          {new Date(displayDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>,
        <StatusBadge key="status" status={a.status} />,
        a.status === "published" ? (
          <Link key="view" href={`/civic/${a.slug}`} target="_blank" className="text-xs font-semibold text-primary hover:underline">
            View
          </Link>
        ) : (
          <span key="view" className="text-xs text-muted-foreground/40">—</span>
        ),
        <RowActions key="actions" id={a.id} kind="announcement" status={a.status} />,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <LguPageHeader title={title} description={description} />
      <Card>
        <CardContent className="p-0">
          <FilterableTable
            columns={[
              { label: "Announcement" },
              { label: "Category" },
              { label: "Reach" },
              { label: "Date" },
              { label: "Status" },
              { label: "Public Page" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<Megaphone />}
            emptyMessage="No announcements in this category yet."
            searchPlaceholder="Search announcements..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
