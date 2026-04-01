import { and, desc, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "../../config/db";
import { financialRecords } from "../../db/schema/financial-records";

interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

export class DashboardRepository {
  private buildWhereClause(filters: DashboardFilters) {
    const conditions = [isNull(financialRecords.deletedAt)];

    if (filters.startDate) {
      conditions.push(gte(financialRecords.date, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(financialRecords.date, filters.endDate));
    }

    return and(...conditions);
  }

  async getTotals(filters: DashboardFilters) {
    const whereClause = this.buildWhereClause(filters);
    const [result] = await db
      .select({
        totalIncome: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'income' then ${financialRecords.amount} else 0 end), 0)`,
        totalExpenses: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'expense' then ${financialRecords.amount} else 0 end), 0)`,
        netBalance: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'income' then ${financialRecords.amount} else -${financialRecords.amount} end), 0)`
      })
      .from(financialRecords)
      .where(whereClause);

    return result;
  }

  async getCategoryTotals(filters: DashboardFilters) {
    const whereClause = this.buildWhereClause(filters);

    return db
      .select({
        category: financialRecords.category,
        type: financialRecords.type,
        total: sql<string>`coalesce(sum(${financialRecords.amount}), 0)`
      })
      .from(financialRecords)
      .where(whereClause)
      .groupBy(financialRecords.category, financialRecords.type)
      .orderBy(financialRecords.category, financialRecords.type);
  }

  async getRecentActivity(filters: DashboardFilters & { limit: number }) {
    const whereClause = this.buildWhereClause(filters);

    return db
      .select()
      .from(financialRecords)
      .where(whereClause)
      .orderBy(desc(financialRecords.date), desc(financialRecords.createdAt))
      .limit(filters.limit);
  }

  async getTrends(filters: DashboardFilters & { granularity: "month" | "week" }) {
    const whereClause = this.buildWhereClause(filters);
    const bucket =
      filters.granularity === "week"
        ? sql<string>`to_char(date_trunc('week', ${financialRecords.date}::timestamp), 'IYYY-"W"IW')`
        : sql<string>`to_char(date_trunc('month', ${financialRecords.date}::timestamp), 'YYYY-MM')`;

    return db
      .select({
        bucket,
        income: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'income' then ${financialRecords.amount} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'expense' then ${financialRecords.amount} else 0 end), 0)`,
        net: sql<string>`coalesce(sum(case when ${financialRecords.type} = 'income' then ${financialRecords.amount} else -${financialRecords.amount} end), 0)`
      })
      .from(financialRecords)
      .where(whereClause)
      .groupBy(bucket)
      .orderBy(bucket);
  }
}

export const dashboardRepository = new DashboardRepository();
