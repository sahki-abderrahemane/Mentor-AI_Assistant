import { z } from "zod";

export const emailSchema = z.string().email();
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
export const nameSchema = z
  .string()
  .min(1, "Required")
  .max(120);