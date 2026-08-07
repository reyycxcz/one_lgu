import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const cityCode = request.nextUrl.searchParams.get("cityCode");

  if (!cityCode) {
    const { data } = await supabase
      .from("barangays")
      .select("municipality, code")
      .eq("province", "Ilocos Norte")
      .order("municipality");

    const citiesMap = new Map<string, string>();
    for (const b of data || []) {
      if (!citiesMap.has(b.municipality)) {
        citiesMap.set(b.municipality, b.code.substring(0, 7) + "0000");
      }
    }

    return NextResponse.json(
      Array.from(citiesMap.entries()).map(([name, code]) => ({ name, code })),
      // Public reference data (municipality/barangay lists), safe to cache
      // briefly at the edge/browser — cuts load on repeated onboarding visits.
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  }

  const prefix = cityCode.substring(0, 7);
  const { data } = await supabase
    .from("barangays")
    .select("name, code")
    .eq("province", "Ilocos Norte")
    .like("code", `${prefix}%`)
    .order("name");

  return NextResponse.json(
    (data || []).map((b) => ({ name: b.name, code: b.code, fullName: b.name })),
    { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
  );
}
