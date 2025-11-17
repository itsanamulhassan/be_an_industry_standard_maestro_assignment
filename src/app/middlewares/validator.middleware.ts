import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";
import safeAsync from "../utils/safeAsync";
import { UserRoleEnumDTO } from "../modules/user/user.types";
import AppError from "../helpers/error.helper";
import message from "../utils/message";
import { StatusCodes } from "http-status-codes";
import { jwt } from "../modules/authentication/authentication.helpers/jwt";
import { User, Users } from "../modules/user/user.models";
import { validateUser } from "../modules/user/user.helpers/validateUser";
import { JWTCredentialProps } from "../types/utils.types";

const schema = <T>(schema: ZodType<T>) =>
  safeAsync(async (req: Request, _res: Response, next: NextFunction) => {
    req.body = await schema.parseAsync(req.body);
    next();
  });

const role = (...roles: UserRoleEnumDTO[]) =>
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

export const validator = {
  schema,
  role,
};
