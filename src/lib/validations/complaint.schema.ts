import { z } from "zod";

export const complaintStatusEnum = z.enum([
  "submitted",
  "under_review",
  "scheduled",
  "mediation",
  "resolved",
  "closed",
]);

export const complaintSchema = z.object({
  respondent_name: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters long").max(100),
  description: z.string().min(10, "Please describe the incident in at least 10 characters").max(1000),
  attachments: z
    .array(
      z.object({
        type: z.string(), // "image" | "video" | "document"
        file_url: z.string().url("Invalid file URL"),
        uploaded_at: z.string(),
      })
    )
    .default([]),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;
