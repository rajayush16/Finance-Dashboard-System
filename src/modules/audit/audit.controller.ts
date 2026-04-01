import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { auditService } from "./audit.service";

export const listAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.listLogs(req.query as never);

  sendSuccess(res, 200, result.data, "Audit logs fetched successfully.", result.meta);
});
