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
authenticationRouter.post("/signout", authenticationControllers.signOut);
authenticationRouter.post("/reset_password");
authenticationRouter.post("/change_password");
authenticationRouter.post("/set_password");
authenticationRouter.post("/forget_password");

export default authenticationRouter;
