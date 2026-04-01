import { z } from "zod";
import { toISODateString } from "../../utils/date";

const dateString = z.coerce
  .date()
  .transform(toISODateString);

export const recordIdParamsSchema = z.object({
  id: z.string().uuid("Record id must be a valid UUID.")
});

export const createRecordSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  type: z.enum(["income", "expense"]),
  category: z.string().trim().min(2).max(100),
  date: dateString,
  notes: z.string().trim().max(1000).optional()
});

export const updateRecordSchema = z
  .object({
    amount: z.coerce.number().positive("Amount must be greater than zero.").optional(),
    type: z.enum(["income", "expense"]).optional(),
    category: z.string().trim().min(2).max(100).optional(),
    date: dateString.optional(),
    notes: z.string().trim().max(1000).optional()
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required for update."
  });

export const listRecordsQuerySchema = z.object({
  type: z.enum(["income", "expense"]).optional(),
  category: z.string().trim().min(1).optional(),
  startDate: dateString.optional(),
  endDate: dateString.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["date", "amount", "createdAt"]).default("date"),
  sortOrder: z.enum(["asc", "desc"]).default("desc")
});
