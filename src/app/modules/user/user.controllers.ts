import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import userServices from "./user.services";

// ✅ Create a new user
const createUser = safeAsync(async (req: Request, res: Response) => {
  const user = await userServices.createUser(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "user"),
    data: user,
  });
});
// ✅ Retrieve Users
const retrieveUsers = safeAsync(async (_req: Request, res: Response) => {
  const users = await userServices.retrieveUsers();
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "users"),
    data: users,
  });
});
// ✅ Retrieve User by ID
const retrieveUser = safeAsync(async (req: Request, res: Response) => {
  const users = await userServices.retrieveUser(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "user"),
    data: users,
  });
});
// ✅ Update user by ID
const updateUser = safeAsync(async (req: Request, res: Response) => {
  const users = await userServices.updateUser(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("update", "user"),
    data: users,
  });
});
// ✅ Retrieve user information by token
const retrieveMe = safeAsync(async (req: Request, res: Response) => {
  const user = await userServices.retrieveMe(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "user"),
    data: user,
  });
});
// ✅ Delete user by ID
const deleteUser = safeAsync(async (req: Request, res: Response) => {
  await userServices.deleteUser(req);

  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("delete", "user"),
  });
});

const userControllers = {
  createUser,
  retrieveUsers,
  updateUser,
  deleteUser,
  retrieveMe,
  retrieveUser,
};

export default userControllers;
