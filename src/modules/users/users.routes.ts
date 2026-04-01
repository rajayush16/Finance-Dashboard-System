import { Router } from "express";
import { authorize } from "../../middlewares/authorize";
import { authenticate } from "../../middlewares/authenticate";
import { validate } from "../../middlewares/validate";
import {
  createUser,
  getUserById,
  listUsers,
  updateUser,
  updateUserStatus
} from "./users.controller";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateStatusSchema,
  updateUserSchema,
  userIdParamsSchema
} from "./users.validation";

const usersRouter = Router();

usersRouter.use(authenticate, authorize("admin"));

usersRouter.get("/", validate({ query: listUsersQuerySchema }), listUsers);
usersRouter.post("/", validate({ body: createUserSchema }), createUser);
usersRouter.get("/:id", validate({ params: userIdParamsSchema }), getUserById);
usersRouter.patch(
  "/:id",
  validate({ params: userIdParamsSchema, body: updateUserSchema }),
  updateUser
);
usersRouter.patch(
  "/:id/status",
  validate({ params: userIdParamsSchema, body: updateStatusSchema }),
  updateUserStatus
);

export { usersRouter };
