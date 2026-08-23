import type { Database } from "./database.types";

export type Complaint = Database["public"]["Tables"]["complaints"]["Row"];
export type ComplaintStatus = Database["public"]["Enums"]["complaint_status"];
export type ComplaintRecordType = Database["public"]["Enums"]["complaint_record_type"];
