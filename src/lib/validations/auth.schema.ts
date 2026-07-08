import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid government or personal email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  barangayId: z.string().uuid("Invalid Barangay ID selection"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long for residents"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
