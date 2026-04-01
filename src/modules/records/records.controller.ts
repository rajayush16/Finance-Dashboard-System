import type { Request, Response } from "express";
import { AppError } from "../../utils/app-error";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { recordsService } from "./records.service";

const getRouteParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

export const createRecord = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const record = await recordsService.createRecord(req.user, req.body);

  sendSuccess(res, 201, record, "Financial record created successfully.");
});

export const listRecords = asyncHandler(async (req: Request, res: Response) => {
  const result = await recordsService.listRecords(req.query as never);

  sendSuccess(res, 200, result.data, "Financial records fetched successfully.", result.meta);
});

export const getRecordById = asyncHandler(async (req: Request, res: Response) => {
  const record = await recordsService.getRecordById(getRouteParam(req.params.id));

  sendSuccess(res, 200, record, "Financial record fetched successfully.");
});

export const updateRecord = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const record = await recordsService.updateRecord(req.user, getRouteParam(req.params.id), req.body);

  sendSuccess(res, 200, record, "Financial record updated successfully.");
});

export const deleteRecord = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const result = await recordsService.deleteRecord(req.user, getRouteParam(req.params.id));

  sendSuccess(res, 200, result, "Financial record deleted successfully.");
});
