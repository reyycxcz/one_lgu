import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ClipboardCheck, AlertTriangle } from "lucide-react";

export default async function SubmissionSummaryPage() {
  const supabase = await createClient();

  const [{ count: reportsCount }, { count: certsCount }, { count: complaintsCount }] = await Promise.all([
    supabase.from("reports").select("*", { count: "exact", head: true }),
    supabase.from("certification_requests").select("*", { count: "exact", head: true }),
    supabase.from("complaints").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { label: "Reports Submitted", value: reportsCount || 0, icon: FileText },
    { label: "Certification Requests", value: certsCount || 0, icon: ClipboardCheck },
    { label: "Complaints Filed", value: complaintsCount || 0, icon: AlertTriangle },
  ];

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Submission Summary"
        description="Total volume of submissions received across all barangays."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
