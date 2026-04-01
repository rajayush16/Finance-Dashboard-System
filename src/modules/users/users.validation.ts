import { z } from "zod";
import { ROLES, USER_STATUSES } from "../../constants/roles";

export const userIdParamsSchema = z.object({
  id: z.string().uuid("User id must be a valid UUID.")
});

export const listUsersQuerySchema = z.object({
  role: z.enum(ROLES).optional(),
  status: z.enum(USER_STATUSES).optional(),
  search: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20)
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  password: z.string().min(8).max(128),
  role: z.enum(ROLES),
  status: z.enum(USER_STATUSES).optional().default("active")
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email().transform((value) => value.toLowerCase()).optional(),
    password: z.string().min(8).max(128).optional(),
    role: z.enum(ROLES).optional(),
    status: z.enum(USER_STATUSES).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update."
  });

export const updateStatusSchema = z.object({
  status: z.enum(USER_STATUSES)
});
