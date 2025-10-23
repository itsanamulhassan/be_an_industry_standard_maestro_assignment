import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { UserDocument } from "../user/user.models";
import AppError from "../../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { validateUser } from "../user/user.helpers/validateUser";
import { token } from "../../utils/token";
import { cookies } from "../../utils/cookies";

const signIn = async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "local",
    async (error: string, user: UserDocument, info: Record<string, string>) => {
      try {
        if (error) {
          return next(new AppError(error, StatusCodes.BAD_REQUEST));
        }
        if (!user) {
          return next(new AppError(info.message, StatusCodes.BAD_REQUEST));
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

        // response = {
        //   user,
        //   accessToken,
        //   refreshToken,
        // };
        console.log({
          user,
          accessToken,
          refreshToken,
        });
      } catch (error) {
        next(error);
      }
    }
  )(req, res, next);
  // return response;
};
export const authenticationServices = {
  signIn,
};
