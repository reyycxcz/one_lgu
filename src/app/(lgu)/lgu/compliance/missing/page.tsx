import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { PaginatedTable } from "@/components/lgu/paginated-table";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

export default async function MissingRequirementsPage() {
  const supabase = await createClient();

  const [{ data: barangays }, { data: reports }] = await Promise.all([
    supabase.from("barangays").select("id, name, municipality").eq("is_active", true).order("name"),
    supabase.from("reports").select("barangay_id, type"),
  ]);

  const submittedTypes = new Map<string, Set<string>>();
  (reports || []).forEach((r) => {
    if (!r.barangay_id) return;
    if (!submittedTypes.has(r.barangay_id)) submittedTypes.set(r.barangay_id, new Set());
    submittedTypes.get(r.barangay_id)!.add(r.type);
  });

  const REQUIRED_TYPES = ["monthly", "financial", "accomplishment", "compliance"];
  const missing = (barangays || [])
    .map((b) => {
      const has = submittedTypes.get(b.id) || new Set();
      const missingTypes = REQUIRED_TYPES.filter((t) => !has.has(t));
      return { ...b, missingTypes };
    })
    .filter((b) => b.missingTypes.length > 0);

  const rows = missing.map((b) => [
    <span key="name" className="font-medium">{b.name}</span>,
    <div key="types" className="flex flex-wrap gap-1.5">
      {b.missingTypes.map((t) => (
        <Badge key={t} variant="destructive" className="capitalize">{t}</Badge>
      ))}
    </div>,
  ]);

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Missing Requirements"
        description="Barangays that have not yet submitted one or more required report types."
      />
      <Card>
        <CardContent className="p-0">
          <PaginatedTable
            columns={[{ label: "Barangay" }, { label: "Missing Report Types" }]}
            rows={rows}
            emptyIcon={<AlertTriangle />}
            emptyMessage="All barangays have submitted every required report type."
          />
        </CardContent>
      </Card>
    </div>
  );
}
