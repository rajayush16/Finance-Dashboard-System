import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { validate } from "../../middlewares/validate";
import {
  createRecord,
  deleteRecord,
  getRecordById,
  listRecords,
  updateRecord
} from "./records.controller";
import {
  createRecordSchema,
  listRecordsQuerySchema,
  recordIdParamsSchema,
  updateRecordSchema
} from "./records.validation";

const recordsRouter = Router();

recordsRouter.use(authenticate);

recordsRouter.get("/", authorize("analyst", "admin"), validate({ query: listRecordsQuerySchema }), listRecords);
recordsRouter.get("/:id", authorize("analyst", "admin"), validate({ params: recordIdParamsSchema }), getRecordById);
recordsRouter.post("/", authorize("admin"), validate({ body: createRecordSchema }), createRecord);
recordsRouter.patch(
  "/:id",
  authorize("admin"),
  validate({ params: recordIdParamsSchema, body: updateRecordSchema }),
  updateRecord
);
recordsRouter.delete(
  "/:id",
  authorize("admin"),
  validate({ params: recordIdParamsSchema }),
  deleteRecord
);

export { recordsRouter };
