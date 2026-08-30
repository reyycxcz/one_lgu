import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { PositionSelect } from "@/components/lgu/position-select";
import { CreateOfficialSheet } from "@/components/lgu/create-official-sheet";
import type { BarangayPosition } from "@/lib/auth/positions";
import { UserCheck } from "lucide-react";

export default async function AssignedSkOfficialsPage() {
  const supabase = await createClient();

  const [{ data: officials }, { data: barangays }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, phone, position, is_active, barangays(name, municipality)")
      .eq("role", "barangay_official")
      .in("position", ["sk_chairman", "sk_secretary", "sk_treasurer"])
      .order("full_name", { ascending: true }),
    supabase
      .from("barangays")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  const rows = (officials || []).map((o) => {
    const barangay = o.barangays as unknown as { name: string; municipality: string } | null;
    return [
      <span key="name" className="font-medium">{o.full_name}</span>,
      <span key="barangay" className="text-muted-foreground">{barangay?.name || "—"}</span>,
      <span key="email" className="text-muted-foreground">{o.email}</span>,
      <span key="phone" className="text-muted-foreground">{o.phone || "—"}</span>,
      <PositionSelect key="position" userId={o.id} position={o.position as BarangayPosition | null} />,
      <Badge key="status" variant={o.is_active ? "default" : "outline"}>
        {o.is_active ? "Active" : "Inactive"}
      </Badge>,
    ];
  });

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Assigned SK Officials"
        description="Sangguniang Kabataan officials registered across the municipality. Assign each account's position to scope what they can access in the barangay portal."
        action={<CreateOfficialSheet barangays={barangays || []} />}
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[
              { label: "Name" },
              { label: "Barangay" },
              { label: "Email" },
              { label: "Phone" },
              { label: "Position" },
              { label: "Status", align: "right" },
            ]}
            rows={rows}
            emptyIcon={<UserCheck />}
            emptyMessage="No SK officials registered yet."
          />
        </CardContent>
      </Card>
    </div>
  );
}
