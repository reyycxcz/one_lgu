import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { BarangayFormSheet } from "@/components/lgu/barangay-form-sheet";
import { Badge } from "@/components/ui/badge";
import { Building2, Pencil } from "lucide-react";

export default async function BarangayProfilesPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: profiles }] = await Promise.all([
    supabase.from("barangays").select("id, name, code, municipality, province, is_active").order("name"),
    supabase.from("profiles").select("barangay_id, role"),
  ]);

  const counts = new Map<string, { officials: number; residents: number }>();
  (profiles || []).forEach((p) => {
    if (!p.barangay_id) return;
    const entry = counts.get(p.barangay_id) || { officials: 0, residents: 0 };
    if (p.role === "barangay_official") entry.officials++;
    if (p.role === "resident") entry.residents++;
    counts.set(p.barangay_id, entry);
  });

  const rows = (barangays || []).map((b) => {
    const c = counts.get(b.id) || { officials: 0, residents: 0 };
    return [
      <span key="name" className="font-medium">{b.name}</span>,
      <span key="code" className="text-muted-foreground text-xs">{b.code}</span>,
      <span key="municipality" className="text-muted-foreground">{b.municipality}</span>,
      <span key="officials">{c.officials}</span>,
      <span key="residents">{c.residents}</span>,
      <Badge key="status" variant={b.is_active ? "default" : "outline"}>
        {b.is_active ? "Active" : "Inactive"}
      </Badge>,
      <BarangayFormSheet
        key="actions"
        mode="edit"
        barangay={b}
        trigger={
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-secondary text-primary hover:bg-secondary/70 transition-colors">
            <Pencil className="h-3 w-3" /> Edit
          </span>
        }
      />,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Barangay Profiles"
        description="Registered officials and residents per barangay."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Barangay" },
              { label: "Code" },
              { label: "Municipality" },
              { label: "Officials", align: "right" },
              { label: "Residents", align: "right" },
              { label: "Status", align: "right" },
              { label: "Actions", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<Building2 />}
            emptyMessage="No barangays registered yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
