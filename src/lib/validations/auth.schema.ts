import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid government or personal email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long for residents"),
});

export const onboardingSchema = z.object({
  municipality: z.string().min(1, "Please select your Municipality / City"),
  barangayCode: z.string().min(1, "Please select your Barangay"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
