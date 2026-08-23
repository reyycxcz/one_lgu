import { redirect } from "next/navigation";
import { requireRole } from "./session";
import { canAccessBarangaySection, type BarangayPosition, type BarangaySection } from "./positions";

/**
 * requireRole(["barangay_official"]) plus position-based section scoping.
 * Redirects to the dashboard (not a 404) since the caller is a legitimate
 * barangay staff member — just not permitted into this particular section.
 *
 * Server-only (pulls in next/headers via session.ts) — do not import this
 * from a Client Component. Import BarangayPosition/canAccessBarangaySection
 * etc. from ./positions instead for anything client-safe.
 */
export async function requireBarangaySection(section: BarangaySection) {
  const profile = await requireRole(["barangay_official"]);
  if (!canAccessBarangaySection(profile.position as BarangayPosition | null, section)) {
    redirect("/barangay/dashboard");
  }
  return profile;
}
