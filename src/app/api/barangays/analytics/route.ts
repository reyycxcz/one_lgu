import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name");

  if (!barangays) return NextResponse.json([]);

  const results = await Promise.all(
    barangays.map(async (bgy) => {
      const [reports, certs, complaints] = await Promise.all([
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("barangay_id", bgy.id),
        supabase.from("certification_requests").select("id", { count: "exact", head: true }).eq("barangay_id", bgy.id),
        supabase.from("complaints").select("id", { count: "exact", head: true }).eq("barangay_id", bgy.id),
      ]);

      return {
        name: bgy.name,
        reports: reports.count || 0,
        certs: certs.count || 0,
        complaints: complaints.count || 0,
      };
    })
  );

  return NextResponse.json(results);
}
