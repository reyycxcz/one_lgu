import { z } from "zod";

export const certificationTypeEnum = z.enum([
  "barangay_clearance",
  "certificate_of_residency",
  "certificate_of_indigency",
  "business_clearance",
  "first_time_job_seeker",
]);

export const certificationStatusEnum = z.enum([
  "submitted",
  "verified",
  "approved",
  "rejected",
  "generated",
  "ready_for_pickup",
  "released",
]);

export const certificationRequestSchema = z.object({
  type: certificationTypeEnum,
  purpose: z.string().min(5, "Purpose must be at least 5 characters long").max(500),
  requirements: z
    .array(
      z.object({
        name: z.string(),
        file_url: z.string().url("Invalid file URL"),
        uploaded_at: z.string(),
      })
    )
    .default([]),
});

export type CertificationRequestInput = z.infer<typeof certificationRequestSchema>;
