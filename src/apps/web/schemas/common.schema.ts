import { z } from "zod";

export const idSchema = z.object({ id: z.string().min(1) });

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
});

export const searchSchema = paginationSchema.extend({
  query: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const emailSchema = z.string().email();
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128);
export const nameSchema = z
  .string()
  .min(1, "Required")
  .max(120);

export const tagSchema = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid tag");

export const urlSchema = z.string().url();

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");
