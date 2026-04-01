import type { NextFunction, Request, Response } from "express";
import type { Role } from "../constants/roles";
import { AppError } from "../utils/app-error";

export const authorize =
  (...allowedRoles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication is required."));
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return next(new AppError(403, "FORBIDDEN", "You do not have access to this resource."));
    }

    next();
  };
