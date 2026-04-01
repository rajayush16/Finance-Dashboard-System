import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { DOCS_PATH } from "../constants/api";
import { env } from "./env";
import { openApiDocument } from "../docs/openapi";

export const registerSwagger = (app: Express): void => {
  if (!env.SWAGGER_ENABLED) {
    return;
  }

  app.use(DOCS_PATH, swaggerUi.serve, swaggerUi.setup(openApiDocument));
};
