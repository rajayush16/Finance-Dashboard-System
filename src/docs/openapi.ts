import { API_PREFIX } from "../constants/api";

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Finance Dashboard Backend API",
    version: "1.0.0",
    description: "Backend API for managing users, financial records, and dashboard analytics."
  },
  servers: [
    {
      url: "/"
    }
  ],
  paths: {
    [`${API_PREFIX}/auth/login`]: {
      post: {
        tags: ["Auth"],
        summary: "Authenticate a user and return a JWT",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          "200": {
            description: "Login successful"
          }
        }
      }
    },
    [`${API_PREFIX}/users`]: {
      get: {
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        summary: "List users",
        parameters: [
          { in: "query", name: "role", schema: { type: "string", enum: ["viewer", "analyst", "admin"] } },
          { in: "query", name: "status", schema: { type: "string", enum: ["active", "inactive"] } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "page", schema: { type: "integer", default: 1 } },
          { in: "query", name: "limit", schema: { type: "integer", default: 20 } }
        ],
        responses: {
          "200": {
            description: "User list"
          }
        }
      },
      post: {
        tags: ["Users"],
        security: [{ bearerAuth: [] }],
        summary: "Create a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateUserRequest"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "User created"
          }
        }
      }
    },
    [`${API_PREFIX}/records`]: {
      get: {
        tags: ["Records"],
        security: [{ bearerAuth: [] }],
        summary: "List financial records",
        parameters: [
          { in: "query", name: "type", schema: { type: "string", enum: ["income", "expense"] } },
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
          { in: "query", name: "endDate", schema: { type: "string", format: "date" } }
        ],
        responses: {
          "200": {
            description: "Record list"
          }
        }
      },
      post: {
        tags: ["Records"],
        security: [{ bearerAuth: [] }],
        summary: "Create a financial record",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateRecordRequest"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Record created"
          }
        }
      }
    },
    [`${API_PREFIX}/dashboard/summary`]: {
      get: {
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Get dashboard summary metrics",
        parameters: [
          { in: "query", name: "startDate", schema: { type: "string", format: "date" } },
          { in: "query", name: "endDate", schema: { type: "string", format: "date" } }
        ],
        responses: {
          "200": {
            description: "Dashboard summary"
          }
        }
      }
    },
    [`${API_PREFIX}/dashboard/trends`]: {
      get: {
        tags: ["Dashboard"],
        security: [{ bearerAuth: [] }],
        summary: "Get monthly or weekly trends",
        parameters: [
          { in: "query", name: "granularity", schema: { type: "string", enum: ["month", "week"] } }
        ],
        responses: {
          "200": {
            description: "Dashboard trends"
          }
        }
      }
    },
    [`${API_PREFIX}/audit-logs`]: {
      get: {
        tags: ["Audit Logs"],
        security: [{ bearerAuth: [] }],
        summary: "List audit logs",
        responses: {
          "200": {
            description: "Audit log list"
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 }
        }
      },
      CreateUserRequest: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          role: { type: "string", enum: ["viewer", "analyst", "admin"] },
          status: { type: "string", enum: ["active", "inactive"] }
        }
      },
      CreateRecordRequest: {
        type: "object",
        required: ["amount", "type", "category", "date"],
        properties: {
          amount: { type: "number", minimum: 0.01 },
          type: { type: "string", enum: ["income", "expense"] },
          category: { type: "string" },
          date: { type: "string", format: "date" },
          notes: { type: "string" }
        }
      }
    }
  }
} as const;
