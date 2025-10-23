import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import userServices from "./user.services";

// ✅ Create a new user
const createUser = safeAsync(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: unusedProperty, ...rest } = (
    await userServices.createUser(req.body)
  ).toObject();
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "user"),
    data: rest,
  });
});
// ✅ Retrieve Users
const retrieveUsers = safeAsync(async (_req: Request, res: Response) => {
  const users = await userServices.retrieveUsers();
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
  const users = await userServices.updateUser(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("update", "user"),
    data: users,
  });
});
// ✅ Delete user by ID
const deleteUser = safeAsync(async (req: Request, res: Response) => {
  const users = await userServices.updateUser(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("delete", "user"),
    data: users,
  });
});

const userControllers = {
  createUser,
  retrieveUsers,
  updateUser,
  deleteUser,
  retrieveMe,
};

export default userControllers;
