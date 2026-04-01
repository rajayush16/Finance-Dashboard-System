import { createPaginationMeta } from "../../utils/pagination";
import { auditRepository } from "./audit.repository";

interface CreateAuditLogInput {
  actorUserId: string;
  entityType: string;
  entityId: string;
  action: "login" | "create" | "update" | "delete" | "status_change" | "role_change";
  metadata?: Record<string, unknown>;
}

interface ListAuditLogsInput {
  entityType?: string;
  actorUserId?: string;
  page: number;
  limit: number;
}

export class AuditService {
  async log(input: CreateAuditLogInput) {
    return auditRepository.createLog(input);
  }

  async listLogs(input: ListAuditLogsInput) {
    const result = await auditRepository.listLogs(input);

    return {
      data: result.items,
      meta: createPaginationMeta(input, result.total)
    };
  }
}

export const auditService = new AuditService();
