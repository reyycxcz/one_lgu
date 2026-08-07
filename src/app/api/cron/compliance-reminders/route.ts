import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyBarangayOfficials } from "@/lib/notifications/notify";

/**
 * Scheduled job (intended for Vercel Cron — see vercel.json) that notifies
 * each barangay's officials about report compliance. For every active barangay
 * that has NOT submitted any report in the last 30 days, it sends a reminder
 * to that barangay's officials.
 *
 * Secured with a bearer token (CRON_SECRET) so it can't be triggered by the
 * public. Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`
 * when the env var is set.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  const { data: barangays } = await supabase
    .from("barangays")
    .select("id, name")
    .eq("is_active", true);

  if (!barangays || barangays.length === 0) {
    return NextResponse.json({ ok: true, reminded: 0 });
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const cutoffIso = cutoff.toISOString();

  let reminded = 0;

  for (const b of barangays) {
    const { count } = await supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .eq("barangay_id", b.id)
      .gte("created_at", cutoffIso);

    if ((count || 0) === 0) {
      await notifyBarangayOfficials({
        barangayId: b.id,
        title: "Report submission reminder",
        message: `${b.name} has not submitted any report in the last 30 days. Please submit your required reports to stay compliant.`,
        type: "compliance_reminder",
        entityType: "barangay",
        entityId: b.id,
      });
      reminded += 1;
    }
  }

  return NextResponse.json({ ok: true, barangays: barangays.length, reminded });
}
