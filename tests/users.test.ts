import request from "supertest";
import { createApp } from "../src/app";
import { signAccessToken } from "../src/utils/jwt";
import { usersRepository } from "../src/modules/users/users.repository";
import { usersService } from "../src/modules/users/users.service";
import { AppError } from "../src/utils/app-error";

jest.mock("../src/modules/users/users.repository", () => ({
  usersRepository: {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    countActiveAdminsExcludingUser: jest.fn(),
    updateById: jest.fn(),
    create: jest.fn(),
    list: jest.fn()
  }
}));

jest.mock("../src/modules/users/users.service", () => ({
  usersService: {
    listUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    updateStatus: jest.fn()
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

describe("User routes", () => {
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

  it("lists users for admins", async () => {
    jest.mocked(usersService.listUsers).mockResolvedValue({
      data: [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "System Admin",
          email: "admin@finance.local",
          role: "admin",
          status: "active",
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
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${buildToken("admin")}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.meta.total).toBe(1);
  });

  it("blocks viewers from user management endpoints", async () => {
    jest.mocked(usersRepository.findById).mockResolvedValue({
      id: "22222222-2222-2222-2222-222222222222",
      name: "Dashboard Viewer",
      email: "viewer@finance.local",
      passwordHash: "hashed",
      role: "viewer",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${buildToken("viewer")}`);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("returns a business-rule error from the service layer", async () => {
    jest.mocked(usersService.updateUser).mockRejectedValue(
      new AppError(
        400,
        "LAST_ACTIVE_ADMIN",
        "You cannot deactivate or demote yourself because this is the last active admin."
      )
    );

    const response = await request(app)
      .patch("/api/v1/users/11111111-1111-1111-1111-111111111111")
      .set("Authorization", `Bearer ${buildToken("admin")}`)
      .send({
        status: "inactive"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("LAST_ACTIVE_ADMIN");
  });
});
