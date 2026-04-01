import type { Role } from "./roles";

export const PERMISSIONS = {
  dashboard: ["viewer", "analyst", "admin"],
  recordsRead: ["analyst", "admin"],
  recordsWrite: ["admin"],
  usersManage: ["admin"],
  auditRead: ["admin"]
} as const satisfies Record<string, Role[]>;
