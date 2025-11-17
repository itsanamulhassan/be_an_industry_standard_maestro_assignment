import safeAsync from "../../utils/safeAsync";
import { NextFunction, Request, Response } from "express";
import { authenticationServices } from "./authentication.services";
import { cookies } from "../../utils/cookies";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";

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
export const authenticationControllers = {
  signIn,
  signOut,
  resetPassword,
  forgetPassword,
  setPassword,
  changePassword,
};
