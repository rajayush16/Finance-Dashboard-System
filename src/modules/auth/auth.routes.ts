import { Router } from "express";
import { login } from "./auth.controller";
import { validate } from "../../middlewares/validate";
import { loginSchema } from "./auth.validation";

const authRouter = Router();

authRouter.post("/login", validate({ body: loginSchema }), login);

export { authRouter };
