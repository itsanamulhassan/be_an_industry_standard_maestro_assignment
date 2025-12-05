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
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUsers
);
// ✅ Get single user
userRouter.get(
  "/:userId",
  validator.role("ADMIN", "SUPERADMIN"),
  userControllers.retrieveUser
);
// ✅ Update user by ID
userRouter.patch(
  "/:userId",
  validator.schema(userSchemas.update),
  validator.role(...userRoleEnum),
  userControllers.updateUser
);
// ✅ Delete user by ID
userRouter.delete(
  "/:userId",
  validator.schema(userSchemas.deleted),
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
