import { StatusCodes } from "http-status-codes";
import { User } from "../user.models";
import message, { MessageType } from "../../../utils/message";
import { UserStatusEnumDTO } from "../user.types";
import AppError from "../../../helpers/error.helper";
export const validateUser = (user: User) => {
  // 404 Not Found → User doesn't exist
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  // 403 Forbidden → User is blocked or inactive
  if (
    ["BLOCKED", "INACTIVE"].includes(user.activityStatus as UserStatusEnumDTO)
  ) {
    throw new AppError(
      message(
        user.activityStatus?.toLowerCase() as MessageType,
        "access token"
      ),
      StatusCodes.FORBIDDEN
    );
  }

  // 410 Gone → User account is deleted
  if (user.isDeleted) {
    throw new AppError(
      "This account has been deleted. Please create a new account or try again later.",
      StatusCodes.GONE
    );
  }

  // 410 Gone → User account is not verified
  if (!user.isVerified) {
    throw new AppError(
      "This account has not been verified. Please verify your account or request a new verification link.",
      StatusCodes.GONE
    );
  }
  return user;
};
