import { NextFunction, Request, Response } from "express";
import safeAsync from "./safeAsync";
import message, { MessageType } from "./message";
import { jwt } from "./jwt";
import { StatusCodes } from "http-status-codes";
import {
  UserActivityStatusEnumDto,
  UserRoleStatusEnumDto,
} from "app/modules/user/user.types";
import AppError from "app/helpers/error.helper";
import { User, Users } from "app/modules/user/user.models";
import { JWTCredentialProps } from "app/types/express";
import { validateUser } from "app/modules/user/user.helpers/validateUser";

const authorizeRole = (...roles: UserRoleStatusEnumDto[]) =>
  safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization;

    // 401 Unauthorized → No token provided
    if (!token) {
      throw new AppError(
        message("notFound", "token"),
        StatusCodes.UNAUTHORIZED
      );
    }

    const verify = jwt.verifyAccessToken(token) as JWTCredentialProps;

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

    const user = (await Users.findOne({ email: verify?.email })) as User;

    validateUser(user);

    // Attach user payload to request
    req.user = verify;
    next();
  });

export const auth = {
  authorizeRole,
};
