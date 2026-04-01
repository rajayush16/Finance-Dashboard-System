import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { API_PREFIX } from "./constants/api";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import { sendSuccess } from "./utils/response";
import { registerSwagger } from "./config/swagger";
import { authRouter } from "./modules/auth/auth.routes";
import { usersRouter } from "./modules/users/users.routes";
import { recordsRouter } from "./modules/records/records.routes";
import { auditRouter } from "./modules/audit/audit.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";

export const createApp = (): express.Express => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    return sendSuccess(res, 200, {
      status: "ok"
    });
  });

  app.get(`${API_PREFIX}/health`, (_req, res) => {
    return sendSuccess(res, 200, {
      status: "ok",
      service: "finance-dashboard-backend"
    });
  });

  app.use(`${API_PREFIX}/auth`, authRouter);
  app.use(`${API_PREFIX}/users`, usersRouter);
  app.use(`${API_PREFIX}/records`, recordsRouter);
  app.use(`${API_PREFIX}/dashboard`, dashboardRouter);
  app.use(`${API_PREFIX}/audit-logs`, auditRouter);

  registerSwagger(app);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
