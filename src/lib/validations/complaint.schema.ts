import { z } from "zod";

const attachmentSchema = z.object({
  type: z.string(), // "image" | "video" | "document"
  file_url: z.string().url("Invalid file URL"),
  uploaded_at: z.string(),
});

// Community/service report: no respondent, optional location/incident time/
// priority/anonymity — never touches mediation-only fields.
export const serviceReportSchema = z.object({
  record_type: z.literal("service_report"),
  type: z.string().min(1, "Select a category"),
  subject: z.string().min(5, "Subject must be at least 5 characters long").max(100),
  description: z.string().min(10, "Please describe the concern in at least 10 characters").max(1000),
  location: z.string().max(255).optional().or(z.literal("")),
  incident_at: z.string().optional().or(z.literal("")),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  is_anonymous: z.coerce.boolean().optional(),
  attachments: z.array(attachmentSchema).default([]),
});

// Formal complaint/dispute: requires a named respondent — this is what
// distinguishes a dispute between identifiable parties from a general
// community concern.
export const formalComplaintSchema = z.object({
  record_type: z.literal("formal_complaint"),
  type: z.string().min(1, "Select a category"),
  respondent_name: z.string().min(2, "Respondent name is required for a formal complaint").max(150),
  subject: z.string().min(5, "Subject must be at least 5 characters long").max(100),
  description: z.string().min(10, "Please describe the situation in at least 10 characters").max(1000),
  attachments: z.array(attachmentSchema).default([]),
});

export const complaintSchema = z.discriminatedUnion("record_type", [serviceReportSchema, formalComplaintSchema]);

export type ComplaintInput = z.infer<typeof complaintSchema>;
