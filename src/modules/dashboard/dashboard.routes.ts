import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  getCategoryTotals,
  getRecentActivity,
  getSummary,
  getTrends
} from "./dashboard.controller";
import {
  dashboardRangeQuerySchema,
  recentActivityQuerySchema,
  trendsQuerySchema
} from "./dashboard.validation";

const dashboardRouter = Router();

dashboardRouter.use(authenticate, authorize("viewer", "analyst", "admin"));

dashboardRouter.get("/summary", validate({ query: dashboardRangeQuerySchema }), getSummary);
dashboardRouter.get(
  "/category-totals",
  validate({ query: dashboardRangeQuerySchema }),
  getCategoryTotals
);
dashboardRouter.get(
  "/recent-activity",
  validate({ query: recentActivityQuerySchema }),
  getRecentActivity
);
dashboardRouter.get("/trends", validate({ query: trendsQuerySchema }), getTrends);

export { dashboardRouter };
