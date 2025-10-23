import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import resHandler from "../../utils/resHandler";
import safeAsync from "../../utils/safeAsync";
import { NextFunction, Request, Response } from "express";
import { authenticationServices } from "./authentication.services";

const signIn = safeAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const response = await authenticationServices.signIn(req, res, next);

    // resHandler(res, {
    //   success: true,
    //   message: message("signIn", "user"),
    //   status: StatusCodes.OK,
    //   data: response,
    // });
  }
);
export const authenticationControllers = {
  signIn,
};
