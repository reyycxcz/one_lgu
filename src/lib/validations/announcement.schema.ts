import { z } from "zod";

export const ANNOUNCEMENT_CATEGORIES = [
  "certification_guide",
  "dispute_mediation",
  "livelihood_programs",
  "clean_and_green",
  "general",
] as const;

export const announcementSchema = z.object({
  category: z.enum(ANNOUNCEMENT_CATEGORIES),
  title: z.string().min(5, "Title must be at least 5 characters long").max(150),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters long").max(300),
  tag: z.string().min(2, "Tag is required").max(40),
  body: z.string().min(20, "Body must be at least 20 characters long").max(8000),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
