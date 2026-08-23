import type { ReportType } from "@/types/report";

// Pure types/constants only — no server-only imports, safe to import from
// Client Components (e.g. components/lgu/department-select.tsx).

export type LguDepartment =
  | "mayor_office"
  | "vice_mayor_office"
  | "administrator_office"
  | "treasurer_office"
  | "assessor_office"
  | "budget_office"
  | "accounting_office"
  | "planning_office"
  | "civil_registrar_office"
  | "health_office"
  | "social_welfare_office"
  | "agriculture_office"
  | "engineering_office"
  | "drrm_office"
  | "business_permits_office"
  | "hr_office"
  | "general_services_office";

export const DEPARTMENT_LABELS: Record<LguDepartment, string> = {
  mayor_office: "Mayor's Office",
  vice_mayor_office: "Vice Mayor's Office / Sangguniang Bayan",
  administrator_office: "Municipal Administrator's Office",
  treasurer_office: "Municipal Treasurer's Office",
  assessor_office: "Municipal Assessor's Office",
  budget_office: "Municipal Budget Office",
  accounting_office: "Municipal Accounting Office",
  planning_office: "Municipal Planning & Development Office (MPDO)",
  civil_registrar_office: "Municipal Civil Registrar's Office",
  health_office: "Municipal Health Office (MHO)",
  social_welfare_office: "Municipal Social Welfare & Development Office (MSWDO)",
  agriculture_office: "Municipal Agriculture Office",
  engineering_office: "Municipal Engineering Office",
  drrm_office: "Municipal Disaster Risk Reduction & Management Office (MDRRMO)",
  business_permits_office: "Business Permits & Licensing Office (BPLO)",
  hr_office: "Human Resource Management Office (HRMO)",
  general_services_office: "General Services Office",
};

// Which report type(s) land in each department's inbox — only these 4
// offices have an automatic Document Submissions feed today. The rest exist
// for org-chart accuracy / future use (e.g. ad hoc barangay beneficiary
// requests) and are label-only until a real document flow is defined for
// them: an lgu_reviewer assigned one of them still gets the scoped
// department nav/dashboard, just with nothing routed to it yet.
export const DEPARTMENT_REPORT_TYPES: Record<LguDepartment, ReportType[]> = {
  mayor_office: ["accomplishment"],
  vice_mayor_office: ["accomplishment"],
  administrator_office: ["monthly"],
  treasurer_office: ["financial"],
  assessor_office: ["financial"],
  budget_office: ["financial"],
  accounting_office: ["financial"],
  planning_office: ["compliance"],
  civil_registrar_office: ["compliance"],
  health_office: ["compliance"],
  social_welfare_office: ["compliance"],
  agriculture_office: ["compliance"],
  engineering_office: ["compliance"],
  drrm_office: ["compliance"],
  business_permits_office: ["financial"],
  hr_office: ["monthly"],
  general_services_office: ["monthly"],
};

export function getDepartmentReportTypes(department: LguDepartment | null | undefined): ReportType[] | null {
  if (!department) return null;
  return DEPARTMENT_REPORT_TYPES[department] || [];
}
