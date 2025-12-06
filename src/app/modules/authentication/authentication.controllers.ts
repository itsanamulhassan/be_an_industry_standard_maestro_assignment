import safeAsync from "../../utils/safeAsync";
import { NextFunction, Request, Response } from "express";
import { authenticationServices } from "./authentication.services";
import { cookies } from "../../utils/cookies";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { UserDocument } from "../user/user.models";
import { token } from "../../utils/token";
import environments from "../../configurations/environments";

const signIn = safeAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await authenticationServices.signIn(req, res, next);
  }
);
const signOut = safeAsync(async (_req: Request, res: Response) => {
  cookies.removeCookies(res, { accessToken: true, refreshToken: true });
  resHandler(res, {
    success: true,
    message: message("signOut", "user"),
    status: StatusCodes.OK,
  });
});

const resetPassword = safeAsync(async (req: Request, res: Response) => {
  await authenticationServices.resetPassword(req);
  resHandler(res, {
    success: true,
    message: message("update", "password"),
    status: StatusCodes.OK,
  });
});

const changePassword = safeAsync(async (req: Request, res: Response) => {
  await authenticationServices.changePassword(req);
  resHandler(res, {
    success: true,
    message: message("update", "password"),
    status: StatusCodes.OK,
  });
});

const setPassword = safeAsync(async (req: Request, res: Response) => {
  await authenticationServices.setPassword(req);
  resHandler(res, {
    success: true,
    message: message("update", "password"),
    status: StatusCodes.OK,
  });
});
const forgetPassword = safeAsync(async (req: Request, res: Response) => {
  await authenticationServices.forgetPassword(req);
  resHandler(res, {
    success: true,
    message: message("success", "sending mail"),
    status: StatusCodes.OK,
  });
});
const retrieveLatestAccessToken = safeAsync(
  async (req: Request, res: Response) => {
    const accessToken = await authenticationServices.retrieveLatestAccessToken(
      req
    );
    cookies.setCookies(res, { accessToken });
    resHandler(res, {
      success: true,
      message: message("create", "access token"),
      status: StatusCodes.CREATED,
      data: {
        accessToken,
      },
    });
  }
);
const googleStrategyCallback = safeAsync(
  async (req: Request, res: Response) => {
    // EXCEPTION: In this project, req.user usually contains only the JWT payload.
    // However, Google strategy attaches the full User document to req.user.
    // This is the ONLY case where req.user holds the entire user object.
    const user = req.user as unknown as UserDocument;
    let redirect = (req.query.state || "") as string;
    if (redirect.startsWith("/")) {
      redirect = redirect.slice(1);
    }

    const payload = {
      credentialId: user?._id.toString(),
      email: user.email,
      role: user.role,
    };
    const { accessToken, refreshToken } =
      token.createAccessRefreshToken(payload);
    cookies.setCookies(res, { accessToken, refreshToken });

    res.redirect(environments.frontend_base_url + "/" + redirect);
  }
);
export const authenticationControllers = {
  signIn,
  signOut,
  resetPassword,
  forgetPassword,
  setPassword,
  changePassword,
  retrieveLatestAccessToken,
  googleStrategyCallback,
};
