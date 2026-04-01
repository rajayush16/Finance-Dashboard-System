import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { dashboardService } from "./dashboard.service";

export const getSummary = asyncHandler(async (req: Request, res: Response) => {
  const summary = await dashboardService.getSummary(req.query as never);

  sendSuccess(res, 200, summary, "Dashboard summary fetched successfully.");
});

export const getCategoryTotals = asyncHandler(async (req: Request, res: Response) => {
  const categoryTotals = await dashboardService.getCategoryTotals(req.query as never);

  sendSuccess(res, 200, categoryTotals, "Dashboard category totals fetched successfully.");
});

export const getRecentActivity = asyncHandler(async (req: Request, res: Response) => {
  const recentActivity = await dashboardService.getRecentActivity(req.query as never);

  sendSuccess(res, 200, recentActivity, "Dashboard recent activity fetched successfully.");
});

export const getTrends = asyncHandler(async (req: Request, res: Response) => {
  const trends = await dashboardService.getTrends(req.query as never);

  sendSuccess(res, 200, trends, "Dashboard trends fetched successfully.");
});
