import { z } from "zod";

const emailSchema = z.string().email();
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
const nameSchema = z
  .string()
  .min(1, "Required")
  .max(120);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  remember: z.boolean().default(true),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;