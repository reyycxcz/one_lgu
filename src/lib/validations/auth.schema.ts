import { z } from "zod";
import { strongPasswordSchema } from "./profile.schema";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid government or personal email"),
  // Intentionally just "non-empty", not the strong-password rule: this checks
  // credentials against accounts that may predate the current policy. Raising
  // this to match registerSchema would risk locking out real existing users
  // whose password was created under a weaker rule.
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: strongPasswordSchema,
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
