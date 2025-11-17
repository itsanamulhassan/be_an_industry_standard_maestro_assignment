import { jwt } from "../modules/authentication/authentication.helpers/jwt";
import { StatusCodes } from "http-status-codes";
import message, { MessageType } from "./message";
import { UserDocument, Users } from "../modules/user/user.models";
import { UserStatusEnumDTO } from "../modules/user/user.types";
import AppError from "../helpers/error.helper";
import { JWTCredentialProps } from "../types/utils.types";

const createAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const { email } = jwt.verifyRefreshToken(refreshToken);
  const user = (await Users.findOne({ email })) as UserDocument;
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.BAD_REQUEST);
  }
  if (["BLOCKED", "INACTIVATED"].includes(user.status as UserStatusEnumDTO)) {
    throw new AppError(
      message(user.status?.toLowerCase() as MessageType, "access token"),
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
  payload: JWTCredentialProps
): { accessToken: string; refreshToken: string } => {
  const accessToken = jwt.signAccessToken(payload);
  const refreshToken = jwt.signRefreshToken(payload);
  return { accessToken, refreshToken };
};

export const token = {
  createAccessTokenWithRefreshToken,
  createAccessRefreshToken,
};
