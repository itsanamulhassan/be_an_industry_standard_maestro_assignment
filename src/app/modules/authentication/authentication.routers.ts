import { NextFunction, Request, Response, Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import {
  authenticationSchemas,
  passwordSchemas,
} from "./authentication.schemas";
import { authenticationControllers } from "./authentication.controllers";
import { userRoleEnum } from "../user/user.schemas";
import passport from "passport";
import environments from "../../configurations/environments";

const authenticationRouter = Router();

authenticationRouter.post(
  "/signin",
  validator.schema(authenticationSchemas.signIn),
  authenticationControllers.signIn
);
authenticationRouter.post("/signout", authenticationControllers.signOut);
authenticationRouter.post(
  "/reset-password",
  validator.schema(passwordSchemas.reset),
  validator.role(...userRoleEnum),
  authenticationControllers.resetPassword
);
authenticationRouter.post(
  "/change-password",
  validator.schema(passwordSchemas.change),
  validator.role(...userRoleEnum),
  authenticationControllers.changePassword
);
authenticationRouter.post(
  "/set-password",
  validator.schema(passwordSchemas.set),
  validator.role(...userRoleEnum),
  authenticationControllers.setPassword
);
authenticationRouter.post(
  "/forget-password",
  validator.schema(passwordSchemas.forget),
  authenticationControllers.forgetPassword
);

authenticationRouter.post(
  "/refresh-access-token",
  authenticationControllers.retrieveLatestAccessToken
);

authenticationRouter.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = (req.query.redirect || "/") as string;

    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect,
    })(req, res, next);
  }
);
authenticationRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${environments.frontend_base_url}/signin?error=There is some issues with your account. Please contact with out support team!`,
  }),
  authenticationControllers.googleStrategyCallback
);
export default authenticationRouter;
