import { dashboardRepository } from "./dashboard.repository";

interface DashboardFilters {
  startDate?: string;
  endDate?: string;
}

const normalizeAmount = (value: string) => Number(value);

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
}) => ({
  id: record.id,
  amount: normalizeAmount(record.amount),
  type: record.type,
  category: record.category,
  date: record.date,
  notes: record.notes,
  createdBy: record.createdBy,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt
});

export class DashboardService {
  async getSummary(filters: DashboardFilters) {
    const [totals, categoryTotals, recentActivity, trend] = await Promise.all([
      dashboardRepository.getTotals(filters),
      dashboardRepository.getCategoryTotals(filters),
      dashboardRepository.getRecentActivity({
        ...filters,
        limit: 5
      }),
      dashboardRepository.getTrends({
        ...filters,
        granularity: "month"
      })
    ]);

    return {
      totalIncome: normalizeAmount(totals.totalIncome),
      totalExpenses: normalizeAmount(totals.totalExpenses),
      netBalance: normalizeAmount(totals.netBalance),
      categoryTotals: categoryTotals.map((item) => ({
        category: item.category,
        type: item.type,
        total: normalizeAmount(item.total)
      })),
      recentActivity: recentActivity.map(serializeRecord),
      trend: trend.map((item) => ({
        bucket: item.bucket,
        income: normalizeAmount(item.income),
        expense: normalizeAmount(item.expense),
        net: normalizeAmount(item.net)
      }))
    };
  }

  async getCategoryTotals(filters: DashboardFilters) {
    const result = await dashboardRepository.getCategoryTotals(filters);

    return result.map((item) => ({
      category: item.category,
      type: item.type,
      total: normalizeAmount(item.total)
    }));
  }

  async getRecentActivity(filters: DashboardFilters & { limit: number }) {
    const result = await dashboardRepository.getRecentActivity(filters);
    return result.map(serializeRecord);
  }

  async getTrends(filters: DashboardFilters & { granularity: "month" | "week" }) {
    const result = await dashboardRepository.getTrends(filters);

    return result.map((item) => ({
      bucket: item.bucket,
      income: normalizeAmount(item.income),
      expense: normalizeAmount(item.expense),
      net: normalizeAmount(item.net)
    }));
  }
}

export const dashboardService = new DashboardService();
