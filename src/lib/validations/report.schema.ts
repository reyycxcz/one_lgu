import { z } from "zod";

export const reportTypeEnum = z.enum(["monthly", "financial", "accomplishment", "compliance"]);

export const reportStatusEnum = z.enum(["submitted", "under_review", "approved", "rejected", "archived"]);

export const reportSchema = z.object({
  type: reportTypeEnum,
  title: z.string().min(5, "Title must be at least 5 characters long").max(150),
  period_start: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
  period_end: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
  file_url: z.string().url("Invalid report file URL"),
  file_name: z.string().min(1, "File name must be specified"),
});

export type ReportInput = z.infer<typeof reportSchema>;
