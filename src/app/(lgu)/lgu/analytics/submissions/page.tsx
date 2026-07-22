import { createClient } from "@/lib/supabase/server";
import { LguPageHeader } from "@/components/lgu/page-header";
import { SubmissionsTrendChart } from "@/components/lgu/charts/submissions-trend-chart";

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default async function SubmissionAnalyticsPage() {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const sinceIso = since.toISOString();

  const [{ data: reports }, { data: certs }, { data: complaints }] = await Promise.all([
    supabase.from("reports").select("created_at").gte("created_at", sinceIso),
    supabase.from("certification_requests").select("created_at").gte("created_at", sinceIso),
    supabase.from("complaints").select("created_at").gte("created_at", sinceIso),
  ]);

  const days = lastNDays(30);
  const counts = new Map(days.map((d) => [d, { reports: 0, certifications: 0, complaints: 0 }]));

  const bump = (rows: { created_at: string }[] | null, key: "reports" | "certifications" | "complaints") => {
    (rows || []).forEach((r) => {
      const day = r.created_at.slice(0, 10);
      const entry = counts.get(day);
      if (entry) entry[key]++;
    });
  };
  bump(reports, "reports");
  bump(certs, "certifications");
  bump(complaints, "complaints");

  const data = days.map((date) => ({ date, ...counts.get(date)! }));

  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Submission Analytics"
        description="Track document submissions across all barangays."
      />
      <SubmissionsTrendChart data={data} />
    </div>
  );
}
