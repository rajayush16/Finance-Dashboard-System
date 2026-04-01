import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/response";
import { usersService } from "./users.service";
import { AppError } from "../../utils/app-error";

const getRouteParam = (value: string | string[]): string => {
  return Array.isArray(value) ? value[0] : value;
};

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.listUsers(req.query as never);

  sendSuccess(res, 200, result.data, "Users fetched successfully.", result.meta);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getUserById(getRouteParam(req.params.id));

  sendSuccess(res, 200, user, "User fetched successfully.");
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.createUser(req.body);

  sendSuccess(res, 201, user, "User created successfully.");
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const user = await usersService.updateUser(req.user, getRouteParam(req.params.id), req.body);

  sendSuccess(res, 200, user, "User updated successfully.");
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication is required.");
  }

  const user = await usersService.updateStatus(
    req.user,
    getRouteParam(req.params.id),
    req.body.status
  );

  sendSuccess(res, 200, user, "User status updated successfully.");
});
