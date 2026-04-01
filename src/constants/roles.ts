export const ROLES = ["viewer", "analyst", "admin"] as const;
export const USER_STATUSES = ["active", "inactive"] as const;

export type Role = (typeof ROLES)[number];
export type UserStatus = (typeof USER_STATUSES)[number];
