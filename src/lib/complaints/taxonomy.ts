import type { Database } from "@/types/database.types";

export type ComplaintRecordType = Database["public"]["Enums"]["complaint_record_type"];
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

export const RECORD_TYPE_LABELS: Record<ComplaintRecordType, string> = {
  service_report: "Community / Service Report",
  formal_complaint: "Formal Complaint / Dispute",
};

// Broad groups a resident/secretary picks from for a service report — the
// specific sub-item (complaint_type) is what actually gets stored.
export const SERVICE_REPORT_CATEGORIES: { group: string; items: { value: string; label: string }[] }[] = [
  {
    group: "Infrastructure",
    items: [
      { value: "road_infrastructure", label: "Damaged Road" },
      { value: "drainage_problem", label: "Drainage Problem" },
      { value: "streetlight_problem", label: "Street Light Problem" },
      { value: "public_facility_damage", label: "Public Facility Damage" },
    ],
  },
  {
    group: "Sanitation",
    items: [
      { value: "garbage_uncollected", label: "Garbage Not Collected" },
      { value: "dirty_public_area", label: "Dirty Public Area" },
    ],
  },
  {
    group: "Public Safety",
    items: [
      { value: "hazardous_area", label: "Hazardous Area" },
      { value: "dangerous_tree", label: "Dangerous Tree" },
      { value: "public_disturbance", label: "Public Disturbance / Noise" },
    ],
  },
  {
    group: "Animals",
    items: [
      { value: "stray_aggressive_animals", label: "Stray / Aggressive Animals" },
    ],
  },
  {
    group: "Environment",
    items: [
      { value: "illegal_dumping", label: "Illegal Dumping" },
      { value: "environmental_concern", label: "Environmental Concern" },
    ],
  },
  {
    group: "Other",
    items: [
      { value: "other", label: "Other Barangay / Community Concern" },
    ],
  },
];

export const DISPUTE_CATEGORIES: { value: string; label: string }[] = [
  { value: "neighbor_dispute", label: "Neighbor Dispute" },
  { value: "property_dispute", label: "Property Dispute" },
  { value: "personal_dispute", label: "Personal Dispute" },
  { value: "obligation_dispute", label: "Dispute Involving an Obligation" },
  { value: "other_dispute", label: "Other Dispute" },
];

// A flat lookup across both lists, for rendering a stored `type` value as a
// label regardless of which category it came from.
export const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(SERVICE_REPORT_CATEGORIES.flatMap((g) => g.items).map((i) => [i.value, i.label])),
  ...Object.fromEntries(DISPUTE_CATEGORIES.map((i) => [i.value, i.label])),
  noise_complaint: "Noise Complaint",
  garbage_illegal_dumping: "Garbage / Illegal Dumping",
};

export function complaintTypeLabel(type: string): string {
  return COMPLAINT_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

// Service reports get assigned to a barangay unit/personnel who don't have
// their own OneLGU accounts (tanod, kagawad, BHW, etc.) — so assignment is
// a free-text label rather than a linked user. This list is just the
// common options a Secretary picks from; "Other" lets them type anything.
export const RESPONSIBLE_UNITS: string[] = [
  "Barangay Tanod",
  "Barangay Kagawad",
  "Barangay Health Worker (BHW)",
  "Barangay Engineering / Maintenance Crew",
  "Sangguniang Kabataan (SK)",
  "Environmental / Sanitation Team",
  "Peace and Order Committee",
  "Other",
];

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// Ordered "happy path" for the timeline/status list UI — not a forced
// ladder for transitions (see *_NEXT_STATUSES below, which allow skipping
// stages), just the reference order the statuses are displayed in.
export const SERVICE_REPORT_STATUS_ORDER: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

export const FORMAL_COMPLAINT_STATUS_ORDER: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "notice_summons",
  "scheduled",
  "mediation",
  "pangkat_conciliation",
  "settled",
  "closed",
];

export const STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: "Submitted",
  under_review: "Under Review",
  assigned: "Assigned",
  in_progress: "In Progress",
  resolved: "Resolved",
  rejected: "Rejected / Invalid",
  closed: "Closed",
  notice_summons: "Notice / Summons Issued",
  scheduled: "Mediation Scheduled",
  mediation: "In Mediation",
  pangkat_conciliation: "Pangkat Conciliation",
  settled: "Settled",
  not_settled: "Not Settled",
};

// From a given status, which statuses can a service report move to next.
// Deliberately NOT a strict ladder anywhere near mediation/Pangkat — those
// statuses aren't even valid for this record type (enforced by the DB
// check constraint chk_status_matches_record_type).
export const SERVICE_REPORT_NEXT_STATUSES: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  submitted: ["under_review", "rejected"],
  under_review: ["assigned", "resolved", "rejected"],
  assigned: ["in_progress", "resolved"],
  in_progress: ["resolved"],
  resolved: ["closed"],
};

// From a given status, which statuses can a formal complaint move to next.
// under_review deliberately branches to notice/scheduled/settled/closed —
// an official can go straight to settlement without ever touching notice,
// scheduling, or Pangkat if the matter doesn't call for it.
export const FORMAL_COMPLAINT_NEXT_STATUSES: Partial<Record<ComplaintStatus, ComplaintStatus[]>> = {
  submitted: ["under_review"],
  under_review: ["notice_summons", "scheduled", "settled", "closed"],
  notice_summons: ["scheduled", "settled", "closed"],
  scheduled: ["mediation", "settled", "closed"],
  mediation: ["pangkat_conciliation", "settled", "not_settled", "closed"],
  pangkat_conciliation: ["settled", "not_settled", "closed"],
  not_settled: ["scheduled", "pangkat_conciliation", "closed"],
  settled: ["closed"],
};

export function nextStatusesFor(recordType: ComplaintRecordType, status: ComplaintStatus): ComplaintStatus[] {
  const map = recordType === "service_report" ? SERVICE_REPORT_NEXT_STATUSES : FORMAL_COMPLAINT_NEXT_STATUSES;
  return map[status] || [];
}
