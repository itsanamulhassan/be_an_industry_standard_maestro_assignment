import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { UserDocument } from "../user/user.models";
import AppError from "../../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { validateUser } from "../user/user.helpers/validateUser";
import { token } from "../../utils/token";
import { cookies } from "../../utils/cookies";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (error: string, user: UserDocument, info: Record<string, string>) => {
      try {
        if (error) {
          return next(new AppError(error, StatusCodes.BAD_REQUEST));
        }
        validateUser(user);

        const payload = {
          credentialId: user._id.toString(),
          email: user.email,
          role: user.role,
        };

        const { accessToken, refreshToken } =
          token.createAccessRefreshToken(payload);
        cookies.setCookies(res, { accessToken, refreshToken });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: unusedPassword, ...rest } = user.toObject();
        resHandler(res, {
          success: true,
          status: StatusCodes.OK,
          message: message("signIn", "user"),
          data: {
            accessToken,
            refreshToken,
            user: rest,
          },
        });
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
};
export const authenticationServices = {
  signIn,
};
