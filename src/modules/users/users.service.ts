import type { AuthenticatedUser } from "../../types/api";
import { usersRepository } from "./users.repository";
import { AppError } from "../../utils/app-error";
import { createPaginationMeta } from "../../utils/pagination";
import { hashPassword } from "../../utils/password";
import type { Role, UserStatus } from "../../constants/roles";
import { auditService } from "../audit/audit.service";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: UserStatus;
}

interface UpdateUserInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
  status?: UserStatus;
}

interface ListUsersInput {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export class UsersService {
  async listUsers(input: ListUsersInput) {
    const result = await usersRepository.list(input);

    return {
      data: result.items.map(sanitizeUser),
      meta: createPaginationMeta(input, result.total)
    };
  }

  async getUserById(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new AppError(404, "NOT_FOUND", "User not found.");
    }

    return sanitizeUser(user);
  }

  async createUser(input: CreateUserInput) {
    const existingUser = await usersRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError(409, "CONFLICT", "A user with this email already exists.");
    }

    const passwordHash = await hashPassword(input.password);
    const createdUser = await usersRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      status: input.status
    });

    await auditService.log({
      actorUserId: createdUser.id,
      entityType: "user",
      entityId: createdUser.id,
      action: "create",
      metadata: {
        role: createdUser.role,
        status: createdUser.status
      }
    });

    return sanitizeUser(createdUser);
  }

  async updateUser(actor: AuthenticatedUser, userId: string, input: UpdateUserInput) {
    const existingUser = await usersRepository.findById(userId);

    if (!existingUser) {
      throw new AppError(404, "NOT_FOUND", "User not found.");
    }

    if (input.email) {
      const emailOwner = await usersRepository.findByEmail(input.email);

      if (emailOwner && emailOwner.id !== userId) {
        throw new AppError(409, "CONFLICT", "A user with this email already exists.");
      }
    }

    await this.ensureAdminSafety(actor, existingUser, input);

    const passwordHash = input.password ? await hashPassword(input.password) : undefined;
    const updatedUser = await usersRepository.updateById(userId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email } : {}),
      ...(passwordHash ? { passwordHash } : {}),
      ...(input.role ? { role: input.role } : {}),
      ...(input.status ? { status: input.status } : {})
    });

    if (!updatedUser) {
      throw new AppError(404, "NOT_FOUND", "User not found.");
    }

    const auditAction =
      input.status && input.status !== existingUser.status
        ? "status_change"
        : input.role && input.role !== existingUser.role
          ? "role_change"
          : "update";

    await auditService.log({
      actorUserId: actor.id,
      entityType: "user",
      entityId: updatedUser.id,
      action: auditAction,
      metadata: {
        changes: input
      }
    });

    return sanitizeUser(updatedUser);
  }

  async updateStatus(actor: AuthenticatedUser, userId: string, status: UserStatus) {
    return this.updateUser(actor, userId, { status });
  }

  private async ensureAdminSafety(
    actor: AuthenticatedUser,
    existingUser: {
      id: string;
      role: Role;
      status: UserStatus;
    },
    input: UpdateUserInput
  ) {
    const nextRole = input.role ?? existingUser.role;
    const nextStatus = input.status ?? existingUser.status;
    const wouldRemoveAdminAccess =
      existingUser.role === "admin" &&
      existingUser.status === "active" &&
      (nextRole !== "admin" || nextStatus !== "active");

    if (!wouldRemoveAdminAccess) {
      return;
    }

    const remainingActiveAdmins = await usersRepository.countActiveAdminsExcludingUser(existingUser.id);

    if (remainingActiveAdmins === 0) {
      const message =
        actor.id === existingUser.id
          ? "You cannot deactivate or demote yourself because this is the last active admin."
          : "This action would remove the last active admin.";

      throw new AppError(400, "LAST_ACTIVE_ADMIN", message);
    }
  }
}

export const usersService = new UsersService();
