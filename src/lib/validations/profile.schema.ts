import { z } from "zod";

export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters long").max(150),
  email: z.string().email("Invalid email address"),
  phone: z.string().max(30).optional().or(z.literal("")),
  address: z.string().max(255).optional().or(z.literal("")),
  barangayCode: z.string().max(30).optional().or(z.literal("")),
});

export const passwordUpdateSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
