import request from "supertest";
import { createApp } from "../src/app";
import { signAccessToken } from "../src/utils/jwt";
import { usersRepository } from "../src/modules/users/users.repository";
import { dashboardService } from "../src/modules/dashboard/dashboard.service";

jest.mock("../src/modules/users/users.repository", () => ({
  usersRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn()
  }
}));

jest.mock("../src/modules/dashboard/dashboard.service", () => ({
  dashboardService: {
    getSummary: jest.fn(),
    getCategoryTotals: jest.fn(),
    getRecentActivity: jest.fn(),
    getTrends: jest.fn()
  }
}));

const app = createApp();

const buildToken = (role: "viewer" | "analyst" | "admin") =>
  signAccessToken({
    sub: "11111111-1111-1111-1111-111111111111",
    email: `${role}@finance.local`,
    role,
    status: "active"
  });

describe("Dashboard routes", () => {
  beforeEach(() => {
    jest.mocked(usersRepository.findById).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash: "hashed",
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });

  it("allows viewers to fetch dashboard summary", async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue({
      id: "55555555-5555-5555-5555-555555555555",
      name: "Dashboard Viewer",
      email: "viewer@finance.local",
      passwordHash: "hashed",
      role: "viewer",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    jest.mocked(dashboardService.getSummary).mockResolvedValue({
      totalIncome: 5000,
      totalExpenses: 1200,
      netBalance: 3800,
      categoryTotals: [
        {
          category: "Salary",
          type: "income",
          total: 5000
        }
      ],
      recentActivity: [],
      trend: [
        {
          bucket: "2026-03",
          income: 5000,
          expense: 1200,
          net: 3800
        }
      ]
    });

    const response = await request(app)
      .get("/api/v1/dashboard/summary")
      .set("Authorization", `Bearer ${buildToken("viewer")}`);

    expect(response.status).toBe(200);
    expect(response.body.data.netBalance).toBe(3800);
  });

  it("returns trends data for analysts", async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Data Analyst",
      email: "analyst@finance.local",
      passwordHash: "hashed",
      role: "analyst",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    jest.mocked(dashboardService.getTrends).mockResolvedValue([
      {
        bucket: "2026-03",
        income: 5000,
        expense: 1200,
        net: 3800
      }
    ]);

    const response = await request(app)
      .get("/api/v1/dashboard/trends?granularity=month")
      .set("Authorization", `Bearer ${buildToken("analyst")}`);

    expect(response.status).toBe(200);
    expect(response.body.data[0].bucket).toBe("2026-03");
  });
});
