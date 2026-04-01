import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../src/app";
import { usersRepository } from "../src/modules/users/users.repository";

jest.mock("../src/modules/users/users.repository", () => ({
  usersRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn()
  }
}));

jest.mock("../src/modules/audit/audit.service", () => ({
  auditService: {
    log: jest.fn()
  }
}));

const app = createApp();

describe("Auth routes", () => {
  it("logs in an active user with valid credentials", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    jest.mocked(usersRepository.findByEmail).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@finance.local",
      password: "Admin@123"
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.role).toBe("admin");
  });

  it("rejects invalid credentials", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    jest.mocked(usersRepository.findByEmail).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash,
      role: "admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@finance.local",
      password: "wrong-password"
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });

  it("rejects inactive users", async () => {
    const passwordHash = await bcrypt.hash("Admin@123", 10);

    jest.mocked(usersRepository.findByEmail).mockResolvedValue({
      id: "11111111-1111-1111-1111-111111111111",
      name: "System Admin",
      email: "admin@finance.local",
      passwordHash,
      role: "admin",
      status: "inactive",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app).post("/api/v1/auth/login").send({
      email: "admin@finance.local",
      password: "Admin@123"
    });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("INACTIVE_USER");
  });
});
