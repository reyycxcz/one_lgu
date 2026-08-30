// The set of document types an LGU department can request from barangays.
// document_requests.document_type is free-text (matches the existing
// pattern for requesting_department_id) — this is just the app-owned
// taxonomy a Select is built from, grouped for a friendlier dropdown.
export const DOCUMENT_REQUEST_TYPE_GROUPS: { group: string; items: { value: string; label: string }[] }[] = [
  {
    group: "Recurring Compliance Reports",
    items: [
      { value: "monthly", label: "Monthly Accomplishment Report" },
      { value: "financial", label: "Financial / Expense Report" },
      { value: "accomplishment", label: "Accomplishment Report" },
      { value: "compliance", label: "Compliance Report (AIP / BDP / GAD)" },
    ],
  },
  {
    group: "Governance & Planning",
    items: [
      { value: "barangay_development_plan", label: "Barangay Development Plan (BDP)" },
      { value: "annual_investment_plan", label: "Annual Investment Plan (AIP)" },
      { value: "barangay_profile", label: "Barangay Profile / Demographics" },
      { value: "budget_report", label: "Barangay Budget Report" },
      { value: "sk_report", label: "SK (Sangguniang Kabataan) Report" },
    ],
  },
  {
    group: "Peace, Safety & Disaster",
    items: [
      { value: "peace_and_order", label: "Peace and Order Report" },
      { value: "drrm_report", label: "Disaster Risk Reduction & Management (DRRM) Report" },
      { value: "vawc_bcpc_report", label: "VAWC / BCPC Case Report" },
    ],
  },
  {
    group: "Health & Social Services",
    items: [
      { value: "health_sanitation_report", label: "Health & Sanitation Report" },
      { value: "nutrition_report", label: "Nutrition Report" },
      { value: "gad_report", label: "Gender and Development (GAD) Report" },
      { value: "senior_pwd_masterlist", label: "Senior Citizen / PWD Masterlist" },
    ],
  },
  {
    group: "Infrastructure & Environment",
    items: [
      { value: "infrastructure_report", label: "Infrastructure Status Report" },
      { value: "environmental_report", label: "Environmental Compliance Report" },
      { value: "solid_waste_report", label: "Solid Waste Management Report" },
    ],
  },
  {
    group: "Other",
    items: [
      { value: "special_project", label: "Special Project Documentation" },
      { value: "other", label: "Other (One-Time) Request" },
    ],
  },
];

export const DOCUMENT_REQUEST_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  DOCUMENT_REQUEST_TYPE_GROUPS.flatMap((g) => g.items).map((i) => [i.value, i.label])
);

// Which document types are relevant to each requesting department — the
// quick-create sheet on a department's dashboard scopes its Document Type
// dropdown to this list (plus "other", always available as a catch-all)
// instead of every department seeing the full 23-item list or, previously,
// being hard-restricted to "other" only regardless of department. Uses
// plain strings (not the LguDepartment type) to avoid this module
// depending on lib/auth/departments — callers index it with a department
// id and fall back to an empty list (→ "other" only) for anything unlisted.
export const DEPARTMENT_DOCUMENT_TYPES: Record<string, string[]> = {
  mayor_office: ["accomplishment", "monthly", "compliance", "special_project"],
  vice_mayor_office: ["accomplishment", "compliance"],
  administrator_office: ["monthly", "accomplishment", "compliance", "special_project"],
  treasurer_office: ["financial", "budget_report"],
  assessor_office: ["financial"],
  budget_office: ["budget_report", "financial", "annual_investment_plan"],
  accounting_office: ["financial"],
  planning_office: ["barangay_development_plan", "annual_investment_plan", "barangay_profile", "compliance"],
  civil_registrar_office: ["barangay_profile"],
  health_office: ["health_sanitation_report", "nutrition_report"],
  social_welfare_office: ["gad_report", "senior_pwd_masterlist", "vawc_bcpc_report"],
  agriculture_office: ["environmental_report"],
  engineering_office: ["infrastructure_report", "solid_waste_report"],
  drrm_office: ["drrm_report", "peace_and_order"],
  business_permits_office: ["financial"],
  hr_office: ["monthly"],
  general_services_office: ["infrastructure_report", "solid_waste_report"],
  dilg_office: ["compliance", "barangay_development_plan", "annual_investment_plan", "peace_and_order", "vawc_bcpc_report", "sk_report"],
};

export function getDepartmentDocumentTypes(department: string | null | undefined): string[] {
  if (!department) return [];
  return DEPARTMENT_DOCUMENT_TYPES[department] || [];
}

// Shared by both the full Create Document Request page and the department
// dashboard's quick-create sheet, so the two never drift out of sync.
// `allowedTypes` undefined (e.g. super_admin, no department scope) means
// unrestricted — the full grouped list. An explicit (possibly empty) array
// scopes down to those values plus "other", always available as a catch-all.
export function filterDocumentTypeGroups(allowedTypes?: string[]) {
  if (!allowedTypes) return DOCUMENT_REQUEST_TYPE_GROUPS;
  return DOCUMENT_REQUEST_TYPE_GROUPS
    .map((group) => ({
      ...group,
      items: group.items.filter((opt) => allowedTypes.includes(opt.value) || opt.value === "other"),
    }))
    .filter((group) => group.items.length > 0);
}

export function documentRequestTypeLabel(type: string | null | undefined): string {
  if (!type) return "General Request";
  return DOCUMENT_REQUEST_TYPE_LABELS[type] || type.replace(/_/g, " ");
}

export type RequestRecurrence = "one_time" | "monthly" | "quarterly" | "annual";

export const RECURRENCE_OPTIONS: { value: RequestRecurrence; label: string }[] = [
  { value: "one_time", label: "One-Time" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

export const RECURRENCE_LABELS: Record<RequestRecurrence, string> = Object.fromEntries(
  RECURRENCE_OPTIONS.map((o) => [o.value, o.label])
) as Record<RequestRecurrence, string>;

export function recurrenceLabel(recurrence: string | null | undefined): string {
  if (!recurrence) return "One-Time";
  return RECURRENCE_LABELS[recurrence as RequestRecurrence] || recurrence.replace(/_/g, " ");
}

// How far out the next cycle's deadline should default to, relative to the
// previous cycle's deadline — staff can still adjust it before dispatching.
export const RECURRENCE_MONTHS_OFFSET: Record<RequestRecurrence, number> = {
  one_time: 0,
  monthly: 1,
  quarterly: 3,
  annual: 12,
};

export function suggestNextDeadline(previousDeadline: string, recurrence: string | null | undefined): string {
  const offset = RECURRENCE_MONTHS_OFFSET[(recurrence as RequestRecurrence) || "one_time"];
  if (!offset) return "";
  const date = new Date(previousDeadline);
  if (Number.isNaN(date.getTime())) return "";
  date.setMonth(date.getMonth() + offset);
  return date.toISOString().slice(0, 10);
}
