import { Router } from "express";
import { userRoleStatusEnum, userSchemas } from "./user.schemas";
import userControllers from "./user.controllers";
import { validator } from "../../middlewares/validator.middleware";
import { auth } from "../../utils/auth";

const userRouter = Router();

// ✅ Create a new user
userRouter.post(
  "/register",
  validator.schema(userSchemas.createUser),
  userControllers.createUser
);
// ✅ Get all the users
userRouter.get(
  "/all",
  auth.authorizeRole("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUsers
);
// ✅ Update user by ID
userRouter.patch(
  "/update/:id",
  validator.schema(userSchemas.updateUser),
  auth.authorizeRole(...userRoleStatusEnum),
  userControllers.updateUser
);
// ✅ Delete user by ID
userRouter.delete(
  "/delete/:id",
  auth.authorizeRole("ADMIN", "SUPERADMIN"),
  userControllers.updateUser
);
// ✅  User information by Access Token
userRouter.get(
  "/me",
  auth.authorizeRole(...userRoleStatusEnum),
  userControllers.updateUser
);

export default userRouter;
