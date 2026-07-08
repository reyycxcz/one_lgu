import { createAdminClient } from "../supabase/admin";

interface AuditLogPayload {
  actorId: string;
  action: string; // e.g. "certification.approved", "complaint.scheduled"
  entityType: string; // "certification_request" | "complaint" | "report"
  entityId: string;
  barangayId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAction(payload: AuditLogPayload) {
  try {
    const supabase = createAdminClient();

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: payload.actorId,
      action: payload.action,
      entity_type: payload.entityType,
      entity_id: payload.entityId,
      barangay_id: payload.barangayId,
      metadata: payload.metadata || {},
      ip_address: payload.ipAddress || null,
    });

    if (error) {
      console.error("Supabase Audit Log error:", error);
    }
  } catch (err) {
    console.error("Centralized Logger critical failure:", err);
  }
}
