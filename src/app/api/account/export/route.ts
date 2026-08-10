import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";

/**
 * Data-subject "export my data" (RA 10173). Uses the caller's own
 * RLS-scoped session client — no admin client needed since every query
 * below is already restricted to rows the requesting user owns.
 */
export async function GET() {
  const session = await requireSession();
  const supabase = await createClient();

  const [profile, certifications, complaints, reports, notifications] = await Promise.all([
    supabase.from("profiles").select("*, barangays(name)").eq("id", session.user.id).single(),
    supabase.from("certification_requests").select("*").eq("requester_id", session.user.id),
    supabase.from("complaints").select("*").eq("complainant_id", session.user.id),
    supabase.from("reports").select("*").eq("submitted_by", session.user.id),
    supabase.from("notifications").select("*").eq("recipient_id", session.user.id),
  ]);

  const payload = {
    exportedAt: new Date().toISOString(),
    profile: profile.data,
    certificationRequests: certifications.data || [],
    complaints: complaints.data || [],
    reports: reports.data || [],
    notifications: notifications.data || [],
  };

  const filename = `onelgu-data-export-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
