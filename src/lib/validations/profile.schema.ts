import { z } from "zod";

// Philippine mobile format: +639XXXXXXXXX or 09XXXXXXXXX, optional spaces/dashes.
const PH_PHONE_REGEX = /^(\+63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long").max(150),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .max(30)
    .regex(PH_PHONE_REGEX, "Enter a valid PH mobile number (e.g. +639171234567 or 09171234567)")
    .optional()
    .or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  barangayCode: z.string().max(30).optional().or(z.literal("")),
});

// Shared strong-password rule: min 8, at least one letter and one number.
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain at least one letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const passwordUpdateSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: strongPasswordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
