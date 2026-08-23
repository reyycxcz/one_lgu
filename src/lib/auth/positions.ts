// Pure types/constants/helpers only — no server-only imports (next/headers
// etc.) so this module is safe to import from Client Components too (e.g.
// components/lgu/position-select.tsx). Server-only guards that need
// requireRole/redirect live in require-barangay-section.ts instead.

export type BarangayPosition = "captain" | "secretary" | "treasurer";

export const POSITION_LABELS: Record<BarangayPosition, string> = {
  captain: "Barangay Captain",
  secretary: "Barangay Secretary",
  treasurer: "Barangay Treasurer",
};

export type BarangaySection =
  | "certifications"
  | "reports"
  | "complaints"
  | "documents"
  | "compliance"
  | "staff"
  | "approvals"
  | "service_reports";

// Positions absent from this map keep full access to every section — that's
// the status quo for Captain and for accounts with no position assigned yet.
// Secretary and Treasurer are scoped to their actual duties: Secretary
// handles certification requests + report submission, Treasurer handles
// report submission only. Neither gets "approvals" — that's the Captain's
// sign-off queue on documents the Secretary sent up, so it stays exclusive
// to Captain/unassigned (unrestricted) positions.
//
// "service_reports" (community/service concerns — streetlight, garbage,
// road damage) is deliberately granted to Secretary: this is pure
// administrative processing (receive, classify, assign, track), not a
// legal/dispute decision. "complaints" (formal disputes — notices,
// mediation, Pangkat) stays OUT of Secretary's allowlist on purpose — the
// Secretary documents disputes but doesn't decide their merits; only
// Captain/unassigned accounts can act on them.
const SECTION_ALLOWLIST: Partial<Record<BarangayPosition, BarangaySection[]>> = {
  secretary: ["certifications", "reports", "compliance", "service_reports"],
  treasurer: ["reports", "compliance"],
};

export function canAccessBarangaySection(
  position: BarangayPosition | null | undefined,
  section: BarangaySection
): boolean {
  if (!position) return true;
  const allowlist = SECTION_ALLOWLIST[position];
  if (!allowlist) return true;
  return allowlist.includes(section);
}
