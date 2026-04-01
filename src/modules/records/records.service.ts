import type { AuthenticatedUser } from "../../types/api";
import { AppError } from "../../utils/app-error";
import { createPaginationMeta } from "../../utils/pagination";
import { auditService } from "../audit/audit.service";
import { recordsRepository } from "./records.repository";

interface CreateRecordInput {
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  notes?: string;
}

interface UpdateRecordInput {
  amount?: number;
  type?: "income" | "expense";
  category?: string;
  date?: string;
  notes?: string;
}

interface ListRecordsInput {
  type?: "income" | "expense";
  category?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
  sortBy: "date" | "amount" | "createdAt";
  sortOrder: "asc" | "desc";
}

const serializeRecord = (record: {
  id: string;
  amount: string;
  type: "income" | "expense";
  category: string;
  date: string;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) => ({
  id: record.id,
  amount: Number(record.amount),
  type: record.type,
  category: record.category,
  date: record.date,
  notes: record.notes,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt
});

export class RecordsService {
  async createRecord(actor: AuthenticatedUser, input: CreateRecordInput) {
    const record = await recordsRepository.create({
      amount: input.amount.toFixed(2),
      type: input.type,
      category: input.category,
      date: input.date,
      notes: input.notes ?? null,
      createdBy: actor.id
    });

    await auditService.log({
      actorUserId: actor.id,
      entityType: "financial_record",
      entityId: record.id,
      action: "create",
      metadata: {
        type: record.type,
        category: record.category
      }
    });

    return serializeRecord(record);
  }

  async listRecords(input: ListRecordsInput) {
    const result = await recordsRepository.list(input);

    return {
      data: result.items.map(serializeRecord),
      meta: createPaginationMeta(input, result.total)
    };
  }

  async getRecordById(recordId: string) {
    const record = await recordsRepository.findById(recordId);

    if (!record) {
      throw new AppError(404, "NOT_FOUND", "Financial record not found.");
    }

    return serializeRecord(record);
  }

  async updateRecord(actor: AuthenticatedUser, recordId: string, input: UpdateRecordInput) {
    const existingRecord = await recordsRepository.findById(recordId);

    if (!existingRecord) {
      throw new AppError(404, "NOT_FOUND", "Financial record not found.");
    }

    const updatedRecord = await recordsRepository.updateById(recordId, {
      ...(input.amount !== undefined ? { amount: input.amount.toFixed(2) } : {}),
      ...(input.type ? { type: input.type } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.date ? { date: input.date } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {})
    });

    if (!updatedRecord) {
      throw new AppError(404, "NOT_FOUND", "Financial record not found.");
    }

    await auditService.log({
      actorUserId: actor.id,
      entityType: "financial_record",
      entityId: updatedRecord.id,
      action: "update",
      metadata: {
        previous: serializeRecord(existingRecord),
        current: serializeRecord(updatedRecord)
      }
    });

    return serializeRecord(updatedRecord);
  }

  async deleteRecord(actor: AuthenticatedUser, recordId: string) {
    const deletedRecord = await recordsRepository.softDelete(recordId);

    if (!deletedRecord) {
      throw new AppError(404, "NOT_FOUND", "Financial record not found.");
    }

    await auditService.log({
      actorUserId: actor.id,
      entityType: "financial_record",
      entityId: deletedRecord.id,
      action: "delete",
      metadata: {
        category: deletedRecord.category,
        type: deletedRecord.type
      }
    });

    return {
      id: deletedRecord.id,
      deletedAt: deletedRecord.deletedAt
    };
  }
}

export const recordsService = new RecordsService();
