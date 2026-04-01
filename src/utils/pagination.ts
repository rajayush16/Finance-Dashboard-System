import type { PaginationMeta } from "../types/api";

export interface PaginationInput {
  page: number;
  limit: number;
}

export const createPaginationMeta = (
  { page, limit }: PaginationInput,
  total: number
): PaginationMeta => {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit))
  };
};
