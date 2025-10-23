import { Request } from "express";
import { SignInDto } from "./authentication.types";
import { Users } from "../user/user.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";

const signIn = async (req: Request) => {
  const payload = req.body as SignInDto;
  const user = await Users.findOne({ email: payload.email });
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }
};
export const authenticationServices = {
  signIn,
};
