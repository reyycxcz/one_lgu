import type { Database } from "./database.types";

export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];

export const COMPLAINT_STATUS_STEPS: ComplaintStatus[] = [
  "submitted",
  "under_review",
  "scheduled",
  "mediation",
  "resolved",
  "closed",
];
