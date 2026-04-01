import { z } from "zod";
import { toISODateString } from "../../utils/date";

const dateString = z.coerce
  .date()
  .transform(toISODateString);

export const dashboardRangeQuerySchema = z.object({
  startDate: dateString.optional(),
  endDate: dateString.optional()
});

export const recentActivityQuerySchema = dashboardRangeQuerySchema.extend({
  limit: z.coerce.number().int().min(1).max(50).default(5)
});

export const trendsQuerySchema = dashboardRangeQuerySchema.extend({
  granularity: z.enum(["month", "week"]).default("month")
});
