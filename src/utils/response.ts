import type { Response } from "express";
import type { PaginationMeta } from "../types/api";

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  data: T,
  message?: string,
  meta?: PaginationMeta
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta
  });
};
