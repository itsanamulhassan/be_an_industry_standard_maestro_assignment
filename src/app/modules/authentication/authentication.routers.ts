import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { authenticationSchemas } from "./authentication.schemas";
import { authenticationControllers } from "./authentication.controllers";

const authenticationRouter = Router();

authenticationRouter.post(
  "/signin",
  validator.schema(authenticationSchemas.signIn),
  authenticationControllers.signIn
);

export default authenticationRouter;
