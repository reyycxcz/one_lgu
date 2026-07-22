import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";

export default async function AssignedOfficialsPage() {
  const supabase = await createClient();

  const { data: officials } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, is_active, barangays(name, municipality)")
    .eq("role", "barangay_official")
    .order("full_name", { ascending: true });

  const rows = (officials || []).map((o) => {
    const barangay = o.barangays as unknown as { name: string; municipality: string } | null;
    return [
      <span key="name" className="font-medium">{o.full_name}</span>,
      <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
      <span key="email" className="text-muted-foreground">{o.email}</span>,
      <span key="phone" className="text-muted-foreground">{o.phone || "—"}</span>,
      <Badge key="status" variant={o.is_active ? "default" : "outline"}>
        {o.is_active ? "Active" : "Inactive"}
      </Badge>,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Assigned Officials"
        description="Barangay officials registered across the municipality."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Name" },
              { label: "Barangay" },
              { label: "Email" },
              { label: "Phone" },
              { label: "Status", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<UserCheck />}
            emptyMessage="No barangay officials registered yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
