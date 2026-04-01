import { and, count, desc, eq } from "drizzle-orm";
import { db } from "../../config/db";
import { auditLogs, type NewAuditLog } from "../../db/schema/audit-logs";

interface ListAuditLogFilters {
  entityType?: string;
  actorUserId?: string;
  page: number;
  limit: number;
}

export class AuditRepository {
  async createLog(data: NewAuditLog) {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }

  async listLogs(filters: ListAuditLogFilters) {
    const conditions = [];

    if (filters.entityType) {
      conditions.push(eq(auditLogs.entityType, filters.entityType));
    }

    if (filters.actorUserId) {
      conditions.push(eq(auditLogs.actorUserId, filters.actorUserId));
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;
    const offset = (filters.page - 1) * filters.limit;

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(auditLogs)
        .where(whereClause)
        .orderBy(desc(auditLogs.createdAt))
        .limit(filters.limit)
        .offset(offset),
      db
        .select({ total: count() })
        .from(auditLogs)
        .where(whereClause)
    ]);

    return {
      items,
      total: Number(totalResult[0]?.total ?? 0)
    };
  }
}

export const auditRepository = new AuditRepository();
