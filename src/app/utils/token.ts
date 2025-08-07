import { Types } from "mongoose";
import { jwt } from "./jwt";
import { StatusCodes } from "http-status-codes";
import message, { MessageType } from "./message";
import { CreateAccessRefreshTokenProps } from "../types/utils.types";
import { Users } from "app/modules/user/user.model";
import {
  CreateUserProps,
  UserActivityStatusEnumProps,
} from "app/modules/user/user.type";
import AppError from "app/helpers/error.helper";

const createAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const { email } = jwt.verifyRefreshToken(refreshToken);
  const user = (await Users.findOne({ email })) as Partial<
    CreateUserProps & { _id: Types.ObjectId }
  >;
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.BAD_REQUEST);
  }
  if (
    ["BLOCKED", "INACTIVE"].includes(
      user.activityStatus as UserActivityStatusEnumProps
    )
  ) {
    throw new AppError(
      message(
        user.activityStatus?.toLowerCase() as MessageType,
        "access token"
      ),
      StatusCodes.BAD_REQUEST
    );
  }
  if (user.isDeleted) {
    throw new AppError(message("delete", "user"), StatusCodes.BAD_REQUEST);
  }

  const { _id, role } = user;
  const credential = {
    credentialId: _id,
    email,
    role,
  };
  const accessToken = jwt.signAccessToken(credential);
  return accessToken;
};
const createAccessRefreshToken = (
  payload: CreateAccessRefreshTokenProps
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.signAccessToken(payload);
  const refreshToken = jwt.signRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const token = {
  createAccessTokenWithRefreshToken,
  createAccessRefreshToken,
};
