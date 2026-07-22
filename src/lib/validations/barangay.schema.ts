import { z } from "zod";

export const barangaySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(100),
  code: z.string().min(2, "Code is required").max(30),
  municipality: z.string().min(2, "Municipality is required").max(100),
  province: z.string().min(2, "Province is required").max(100),
});

export type BarangayInput = z.infer<typeof barangaySchema>;
