import { Router } from "express";
import { userRoleEnum, userSchemas } from "./user.schemas";
import userControllers from "./user.controllers";
import { validator } from "../../middlewares/validator.middleware";

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
  validator.role("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUsers
);
// ✅ Get all the users
userRouter.get(
  "/single/:id",
  validator.role("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUser
);
// ✅ Update user by ID
userRouter.patch(
  "/update/:id",
  validator.schema(userSchemas.update),
  validator.role(...userRoleEnum),
  userControllers.updateUser
);
// ✅ Delete user by ID
userRouter.delete(
  "/delete/:id",
  validator.role(...userRoleEnum),
  userControllers.deleteUser
);
// ✅  User information by Access Token
userRouter.get(
  "/me",
  validator.role(...userRoleEnum),
  userControllers.retrieveMe
);

export default userRouter;
