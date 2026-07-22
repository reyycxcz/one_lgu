import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarangayFormSheet } from "@/components/lgu/barangay-form-sheet";

export default async function LguBarangayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: barangay } = await supabase
    .from("barangays")
    .select("*")
    .eq("id", id)
    .single();

  if (!barangay) notFound();

  const [{ count: officialsCount }, { count: residentsCount }, { count: reportsCount }, { count: certsCount }, { count: complaintsCount }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("barangay_id", id).eq("role", "barangay_official"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("barangay_id", id).eq("role", "resident"),
    supabase.from("reports").select("*", { count: "exact", head: true }).eq("barangay_id", id),
    supabase.from("certification_requests").select("*", { count: "exact", head: true }).eq("barangay_id", id),
    supabase.from("complaints").select("*", { count: "exact", head: true }).eq("barangay_id", id),
  ]);

  const stats = [
    { label: "Officials", value: officialsCount || 0 },
    { label: "Residents", value: residentsCount || 0 },
    { label: "Reports", value: reportsCount || 0 },
    { label: "Certifications", value: certsCount || 0 },
    { label: "Complaints", value: complaintsCount || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/lgu/barangays" className="inline-flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground mb-3">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Directory
          </Link>
          <h1 className="font-sans font-bold text-2xl tracking-tight mt-1">{barangay.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{barangay.municipality}, {barangay.province} · {barangay.code}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={barangay.is_active ? "default" : "outline"}>
            {barangay.is_active ? "Active" : "Inactive"}
          </Badge>
          <BarangayFormSheet
            mode="edit"
            barangay={barangay}
            trigger={
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-secondary text-primary hover:bg-secondary/70 transition-colors">
                <Pencil className="h-3.5 w-3.5" /> Edit
              </span>
            }
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
