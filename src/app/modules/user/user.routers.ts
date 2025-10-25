import { Router } from "express";
import { userRoleStatusEnum, userSchemas } from "./user.schemas";
import userControllers from "./user.controllers";
import { validator } from "../../middlewares/validator.middleware";
import { auth } from "../authentication/authentication.helpers/auth";

const userRouter = Router();

// ✅ Create a new user
userRouter.post(
  "/register",
  validator.schema(userSchemas.create),
  userControllers.createUser
);
// ✅ Get all the users
userRouter.get(
  "/all",
  auth.authorizeRole("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUsers
);
// ✅ Get all the users
userRouter.get(
  "/single/:id",
  auth.authorizeRole("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUser
);
// ✅ Update user by ID
userRouter.patch(
  "/update/:id",
  validator.schema(userSchemas.update),
  auth.authorizeRole(...userRoleStatusEnum),
  userControllers.updateUser
);
// ✅ Delete user by ID
userRouter.delete(
  "/delete/:id",
  auth.authorizeRole(...userRoleStatusEnum),
  userControllers.deleteUser
);
// ✅  User information by Access Token
userRouter.get(
  "/me",
  auth.authorizeRole(...userRoleStatusEnum),
  userControllers.retrieveMe
);

export default userRouter;
