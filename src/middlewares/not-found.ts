import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";

export const notFound = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(404, "NOT_FOUND", "The requested resource was not found."));
};
