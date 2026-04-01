import jwt from "jsonwebtoken";
import { env } from "../config/env";
import type { Role, UserStatus } from "../constants/roles";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: Role;
  status: UserStatus;
}

export const signAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};
