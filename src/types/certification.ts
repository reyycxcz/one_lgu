import type { Database } from "./database.types";

export type CertificationRequest = Database["public"]["Tables"]["certification_requests"]["Row"];
export type CertificationType = Database["public"]["Enums"]["certification_type"];
export type CertificationStatus = Database["public"]["Enums"]["certification_status"];

export const CERTIFICATION_TYPE_LABELS: Record<CertificationType, string> = {
  barangay_clearance: "Barangay Clearance",
  certificate_of_residency: "Certificate of Residency",
  certificate_of_indigency: "Certificate of Indigency",
  business_clearance: "Business Clearance",
  first_time_job_seeker: "First-Time Job Seeker Certificate",
};

export const CERTIFICATION_STATUS_STEPS: CertificationStatus[] = [
  "submitted",
  "verified",
  "approved",
  "generated",
  "ready_for_pickup",
  "released",
];
