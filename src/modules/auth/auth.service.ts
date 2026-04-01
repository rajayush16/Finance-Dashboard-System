import { usersRepository } from "../users/users.repository";
import { AppError } from "../../utils/app-error";
import { comparePassword } from "../../utils/password";
import { signAccessToken } from "../../utils/jwt";
import { auditService } from "../audit/audit.service";

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  async login({ email, password }: LoginInput) {
    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password.");
    }

    if (user.status !== "active") {
      throw new AppError(403, "INACTIVE_USER", "This user account is inactive.");
    }

    const passwordMatches = await comparePassword(password, user.passwordHash);

    if (!passwordMatches) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid email or password.");
    }

    const token = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    });

    await auditService.log({
      actorUserId: user.id,
      entityType: "user",
      entityId: user.id,
      action: "login",
      metadata: {
        role: user.role
      }
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    };
  }
}

export const authService = new AuthService();
