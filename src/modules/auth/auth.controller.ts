import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { sendSuccess } from "../../utils/response";
import { asyncHandler } from "../../utils/async-handler";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);

  sendSuccess(res, 200, result, "Login successful.");
});
