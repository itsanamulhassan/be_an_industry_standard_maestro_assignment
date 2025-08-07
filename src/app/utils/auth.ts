import { NextFunction, Request, Response } from "express";
import safeAsync from "./safeAsync";
import message, { MessageType } from "./message";
import { jwt } from "./jwt";
import { StatusCodes } from "http-status-codes";
import {
  UserActivityStatusEnumProps,
  UserRoleStatusEnumProps,
} from "app/modules/user/user.type";
import AppError from "app/helpers/error.helper";
import { Users } from "app/modules/user/user.model";

const authorizeRole = (...roles: UserRoleStatusEnumProps[]) =>
  safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // 401 Unauthorized → No token provided
    if (!token) {
      throw new AppError(
        message("notFound", "token"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const verify = jwt.verifyAccessToken(token);

    // 401 Unauthorized → Invalid or expired token
    if (!verify) {
      throw new AppError(message("expired", "token"), StatusCodes.UNAUTHORIZED);
    }

    // 403 Forbidden → User has no permission
    if (!roles.includes(verify.role)) {
      throw new AppError(
        message("unauthorized", "user"),
        StatusCodes.FORBIDDEN
      );
    }

    const user = await Users.findOne({ email: verify?.email });

    // 404 Not Found → User doesn't exist
    if (!user) {
      throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
    }

    // 403 Forbidden → User is blocked or inactive
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
        StatusCodes.FORBIDDEN
      );
    }

    // 410 Gone → User is deleted
    if (user.isDeleted) {
      throw new AppError(message("delete", "user"), StatusCodes.GONE);
    }

    // Attach user payload to request
    req.user = verify;
    next();
  });

export const auth = {
  authorizeRole,
};
