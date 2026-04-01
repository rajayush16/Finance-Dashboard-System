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
      url: API_PREFIX
    }
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  }
} as const;
