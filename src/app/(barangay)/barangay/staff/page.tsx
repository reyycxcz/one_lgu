import { createClient } from "@/lib/supabase/server";
import { requireBarangaySection } from "@/lib/auth/require-barangay-section";
import { POSITION_LABELS, type BarangayPosition } from "@/lib/auth/positions";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export default async function BarangayStaffPage() {
  const profile = await requireBarangaySection("staff");
  const supabase = await createClient();

  const { data: staff } = await supabase
    .from("profiles")
    .select("id, full_name, email, phone, role, position, is_active")
    .eq("barangay_id", profile.barangay_id || "")
    .eq("role", "barangay_official")
    .order("full_name", { ascending: true });

  const rows = (staff || []).map((s) => [
    <span key="name" className="font-medium">{s.full_name}</span>,
    <span key="position" className="text-muted-foreground">
      {s.position ? POSITION_LABELS[s.position as BarangayPosition] : "—"}
    </span>,
    <span key="email" className="text-muted-foreground">{s.email}</span>,
    <span key="phone" className="text-muted-foreground">{s.phone || "—"}</span>,
    <Badge key="status" variant={s.is_active ? "default" : "outline"}>
      {s.is_active ? "Active" : "Inactive"}
    </Badge>,
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">Staff Accounts</h1>
        <p className="text-sm text-foreground/60 mt-1">Barangay staff accounts registered to this barangay. Positions are assigned by the LGU admin.</p>
      </div>
      <div className="bryl-card p-0">
        <PaginatedTable
          columns={[
            { label: "Name" },
            { label: "Position" },
            { label: "Email" },
            { label: "Phone" },
            { label: "Status", align: "right" },
          ]}
          rows={rows}
          emptyIcon={<Users />}
          emptyMessage="No staff accounts registered to this barangay yet."
        />
      </div>
    </div>
  );
}
