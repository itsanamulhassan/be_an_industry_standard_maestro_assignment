import { NextFunction, Request, Response } from "express";
import safeAsync from "./safeAsync";
import { jwt } from "./jwt";
import { StatusCodes } from "http-status-codes";
import { UserRoleStatusEnumDto } from "../modules/user/user.types";
import AppError from "../helpers/error.helper";
import { User, Users } from "../modules/user/user.models";
import { validateUser } from "../modules/user/user.helpers/validateUser";
import message from "./message";
import { JWTCredentialProps } from "../types/express";

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
