import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import { listAuditLogs } from "./audit.controller";
import { listAuditLogsQuerySchema } from "./audit.validation";

const auditRouter = Router();

auditRouter.use(authenticate, authorize("admin"));
auditRouter.get("/", validate({ query: listAuditLogsQuerySchema }), listAuditLogs);

export { auditRouter };
