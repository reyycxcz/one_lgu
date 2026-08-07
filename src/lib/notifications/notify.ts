import { createAdminClient } from "../supabase/admin";

interface NotifyPayload {
  recipientId: string;
  title: string;
  message: string;
  type: string; // "certification_update" | "complaint_update" | "report_update" | "announcement" | ...
  entityType?: string;
  entityId?: string;
}

/**
 * Insert an in-app notification for a single recipient. Uses the service-role
 * admin client because the "notifications" RLS policy only lets a user read
 * their OWN rows — a barangay official notifying a resident about a status
 * change would otherwise be blocked. Best-effort: never throws into the
 * calling server action (a failed notification shouldn't fail the main write).
 */
export async function notifyUser(payload: NotifyPayload) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("notifications").insert({
      recipient_id: payload.recipientId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
      entity_type: payload.entityType ?? null,
      entity_id: payload.entityId ?? null,
    });
    if (error) {
      console.error("notifyUser error:", error);
    }
  } catch (err) {
    console.error("notifyUser critical failure:", err);
  }
}

interface NotifyBarangayPayload {
  barangayId: string;
  title: string;
  message: string;
  type: string;
  entityType?: string;
  entityId?: string;
}

/**
 * Notify every active barangay_official assigned to a barangay — used when a
 * resident submits a new certification request or complaint so officials see
 * it in their bell without polling. Best-effort, service-role.
 */
export async function notifyBarangayOfficials(payload: NotifyBarangayPayload) {
  try {
    const supabase = createAdminClient();
    const { data: officials } = await supabase
      .from("profiles")
      .select("id")
      .eq("barangay_id", payload.barangayId)
      .eq("role", "barangay_official")
      .eq("is_active", true);

    if (!officials || officials.length === 0) return;

    const { error } = await supabase.from("notifications").insert(
      officials.map((o) => ({
        recipient_id: o.id,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        entity_type: payload.entityType ?? null,
        entity_id: payload.entityId ?? null,
      }))
    );
    if (error) {
      console.error("notifyBarangayOfficials error:", error);
    }
  } catch (err) {
    console.error("notifyBarangayOfficials critical failure:", err);
  }
}
