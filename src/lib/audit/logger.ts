import { headers } from "next/headers";
import { createAdminClient } from "../supabase/admin";

interface AuditLogPayload {
  actorId: string;
  action: string; // e.g. "certification.approved", "complaint.scheduled"
  entityType: string; // "certification_request" | "complaint" | "report"
  entityId: string;
  barangayId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  // Before/after snapshots for status or field changes. Stored inside the
  // existing `metadata` jsonb column (no schema change needed) rather than
  // dedicated old_value/new_value columns.
  oldValue?: Record<string, unknown> | string | null;
  newValue?: Record<string, unknown> | string | null;
}

export async function logAction(payload: AuditLogPayload) {
  try {
    const supabase = createAdminClient();

    // Every current caller runs inside a Server Action, so there's always an
    // incoming request to read these from. ip_address has its own column
    // (pre-existing); user_agent piggybacks on metadata to avoid a migration.
    let ipAddress = payload.ipAddress || null;
    let userAgent: string | null = null;
    try {
      const h = await headers();
      if (!ipAddress) {
        ipAddress = h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null;
      }
      userAgent = h.get("user-agent");
    } catch {
      // No request context (e.g. called from a background job) — skip.
    }

    const metadata: Record<string, unknown> = { ...(payload.metadata || {}) };
    if (userAgent) metadata.user_agent = userAgent;
    if (payload.oldValue !== undefined) metadata.old_value = payload.oldValue;
    if (payload.newValue !== undefined) metadata.new_value = payload.newValue;

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: payload.actorId,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      barangay_id: payload.barangayId,
      metadata,
      ip_address: ipAddress,
    });

    if (error) {
      console.error("Supabase Audit Log error:", error);
    }
  } catch (err) {
    console.error("Centralized Logger critical failure:", err);
  }
}
