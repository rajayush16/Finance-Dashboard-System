import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  isNull,
  lte,
  sql
} from "drizzle-orm";
import { db } from "../../config/db";
import { financialRecords, type NewFinancialRecord } from "../../db/schema/financial-records";

interface ListRecordsFilters {
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: "date" | "amount" | "createdAt";
  sortOrder: "asc" | "desc";
}

export class RecordsRepository {
  async create(data: NewFinancialRecord) {
    const [record] = await db.insert(financialRecords).values(data).returning();
    return record;
  }

  async findById(id: string) {
    const [record] = await db
      .select()
      .from(financialRecords)
      .where(and(eq(financialRecords.id, id), isNull(financialRecords.deletedAt)));

    return record ?? null;
  }

  async list(filters: ListRecordsFilters) {
    const conditions = [isNull(financialRecords.deletedAt)];

    if (filters.type) {
      conditions.push(eq(financialRecords.type, filters.type));
    }

    if (filters.category) {
      conditions.push(eq(financialRecords.category, filters.category));
    }

    if (filters.startDate) {
      conditions.push(gte(financialRecords.date, filters.startDate));
    }

    if (filters.endDate) {
      conditions.push(lte(financialRecords.date, filters.endDate));
    }

    const whereClause = and(...conditions);
    const offset = (filters.page - 1) * filters.limit;
    const sortColumnMap = {
      date: financialRecords.date,
      amount: sql`${financialRecords.amount}`,
      createdAt: financialRecords.createdAt
    };
    const orderByColumn = sortColumnMap[filters.sortBy];
    const orderDirection = filters.sortOrder === "asc" ? asc(orderByColumn) : desc(orderByColumn);

    const [items, totalResult] = await Promise.all([
      db
        .select()
        .from(financialRecords)
        .where(whereClause)
        .limit(filters.limit)
        .offset(offset)
        .orderBy(orderDirection),
      db
        .select({ total: count() })
        .from(financialRecords)
        .where(whereClause)
    ]);

    return {
      items,
      total: Number(totalResult[0]?.total ?? 0)
    };
  }

  async updateById(id: string, data: Partial<NewFinancialRecord>) {
    const [record] = await db
      .update(financialRecords)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(and(eq(financialRecords.id, id), isNull(financialRecords.deletedAt)))
      .returning();

    return record ?? null;
  }

  async softDelete(id: string) {
    const [record] = await db
      .update(financialRecords)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(eq(financialRecords.id, id), isNull(financialRecords.deletedAt)))
      .returning();

    return record ?? null;
  }
}

export const recordsRepository = new RecordsRepository();
