import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/app-error";
import { verifyAccessToken } from "../utils/jwt";
import { usersRepository } from "../modules/users/users.repository";

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader?.startsWith("Bearer ")) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication token is required."));
    }

    const token = authorizationHeader.split(" ")[1];
    const payload = verifyAccessToken(token);
    const user = await usersRepository.findById(payload.sub);

    if (!user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication token is invalid."));
    }

    if (user.status !== "active") {
      return next(new AppError(403, "INACTIVE_USER", "This user account is inactive."));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    next(new AppError(401, "UNAUTHORIZED", "Authentication token is invalid.", error));
  }
};
