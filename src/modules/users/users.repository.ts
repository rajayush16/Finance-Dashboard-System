import { and, count, eq, ilike, ne, or, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { users, type NewUser } from "../../db/schema/users";
import type { Role, UserStatus } from "../../constants/roles";

interface ListUsersFilters {
  role?: Role;
  status?: UserStatus;
  search?: string;
  page: number;
  limit: number;
}

export class UsersRepository {
  async create(data: NewUser) {
    const [user] = await db.insert(users).values(data).returning();
    return user;
  }

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user ?? null;
  }

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }

  async countActiveAdminsExcludingUser(userId?: string) {
    const filters = [eq(users.role, "admin"), eq(users.status, "active")];

    if (userId) {
      filters.push(ne(users.id, userId));
    }

    const [result] = await db
      .select({ total: count() })
      .from(users)
      .where(and(...filters));

    return Number(result?.total ?? 0);
  }

  async updateById(id: string, data: Partial<NewUser>) {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();

    return updatedUser ?? null;
  }

  async list(filters: ListUsersFilters) {
    const conditions = [];

    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }

    if (filters.status) {
      conditions.push(eq(users.status, filters.status));
    }

    if (filters.search) {
      conditions.push(or(ilike(users.email, `%${filters.search}%`), ilike(users.name, `%${filters.search}%`))!);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(users)
        .where(whereClause)
        .limit(filters.limit)
        .offset(offset)
        .orderBy(sql`${users.createdAt} desc`),
      db
        .select({ total: count() })
        .from(users)
        .where(whereClause)
    ]);

    return {
      items,
      total: Number(totalResult[0]?.total ?? 0)
    };
  }
}

export const usersRepository = new UsersRepository();
