import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Serialize a value as a safe CSV field (quote + escape embedded quotes).
function csvCell(value: unknown): string {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

/**
 * Export audit logs as CSV. Restricted to super_admin — lgu_reviewer only
 * has read access to audit logs in the UI, not export (see FIXES-CHECKLIST).
 */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // RLS scopes rows to what this actor is allowed to read.
  const { data: logs, error } = await supabase
    .from("audit_logs")
    .select("created_at, action, entity_type, entity_id, ip_address, profiles!audit_logs_actor_id_fkey(full_name), barangays(name)")
    .order("created_at", { ascending: false })
    .limit(10000);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = ["Timestamp", "User", "Action", "Entity Type", "Entity ID", "Barangay", "IP Address"];
  const lines = [header.map(csvCell).join(",")];

  for (const l of logs || []) {
    const actor = l.profiles as unknown as { full_name: string } | null;
    const barangay = l.barangays as unknown as { name: string } | null;
    lines.push(
      [
        new Date(l.created_at).toISOString(),
        actor?.full_name || "",
        l.action,
        l.entity_type,
        l.entity_id,
        barangay?.name || "",
        l.ip_address || "",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  const csv = lines.join("\r\n");
  const filename = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
