import request from "supertest";
import { createApp } from "../src/app";
import { signAccessToken } from "../src/utils/jwt";
import { usersRepository } from "../src/modules/users/users.repository";
import { recordsService } from "../src/modules/records/records.service";

jest.mock("../src/modules/users/users.repository", () => ({
  usersRepository: {
    findById: jest.fn(),
    findByEmail: jest.fn()
  }
}));

jest.mock("../src/modules/records/records.service", () => ({
  recordsService: {
    createRecord: jest.fn(),
    listRecords: jest.fn(),
    getRecordById: jest.fn(),
    updateRecord: jest.fn(),
    deleteRecord: jest.fn()
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

describe("Record routes", () => {
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

  it("allows analysts to list records", async () => {
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

    jest.mocked(recordsService.listRecords).mockResolvedValue({
      data: [
        {
          id: "33333333-3333-3333-3333-333333333333",
          amount: 1200,
          type: "income",
          category: "Salary",
          date: "2026-03-28",
          notes: "Monthly salary",
          createdBy: "11111111-1111-1111-1111-111111111111",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1
      }
    });

    const response = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${buildToken("analyst")}`);

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(1);
  });

  it("blocks viewers from records endpoints", async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue({
      id: "44444444-4444-4444-4444-444444444444",
      name: "Dashboard Viewer",
      email: "viewer@finance.local",
      passwordHash: "hashed",
      role: "viewer",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .get("/api/v1/records")
      .set("Authorization", `Bearer ${buildToken("viewer")}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("allows admins to create records", async () => {
    jest.mocked(recordsService.createRecord).mockResolvedValue({
      id: "33333333-3333-3333-3333-333333333333",
      amount: 1200,
      type: "income",
      category: "Salary",
      date: "2026-03-28",
      notes: "Monthly salary",
      createdBy: "11111111-1111-1111-1111-111111111111",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .post("/api/v1/records")
      .set("Authorization", `Bearer ${buildToken("admin")}`)
      .send({
        amount: 1200,
        type: "income",
        category: "Salary",
        date: "2026-03-28",
        notes: "Monthly salary"
      });

    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe("income");
  });
});
