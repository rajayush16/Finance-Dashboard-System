import {
  date,
  index,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const recordTypeEnum = pgEnum("record_type", ["income", "expense"]);

export const financialRecords = pgTable(
  "financial_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    type: recordTypeEnum("type").notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true })
  },
  (table) => ({
    dateTypeIdx: index("financial_records_date_type_idx").on(table.date, table.type),
    categoryIdx: index("financial_records_category_idx").on(table.category),
    createdByIdx: index("financial_records_created_by_idx").on(table.createdBy),
    deletedAtIdx: index("financial_records_deleted_at_idx").on(table.deletedAt)
  })
);

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type NewFinancialRecord = typeof financialRecords.$inferInsert;
