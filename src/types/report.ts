import type { Database } from "./database.types";

export type Report = Database["public"]["Tables"]["reports"]["Row"];
export type ReportType = Database["public"]["Enums"]["report_type"];
export type ReportStatus = Database["public"]["Enums"]["report_status"];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  monthly: "Monthly Report",
  financial: "Financial Report",
  accomplishment: "Accomplishment Report",
  compliance: "Compliance Report",
  other: "Other (One-Time) Request",
};
