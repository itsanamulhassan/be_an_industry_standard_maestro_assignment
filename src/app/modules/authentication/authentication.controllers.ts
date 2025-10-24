import safeAsync from "../../utils/safeAsync";
import { NextFunction, Request, Response } from "express";
import { authenticationServices } from "./authentication.services";

const signIn = safeAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    await authenticationServices.signIn(req, res, next);
  }
);
export const authenticationControllers = {
  signIn,
};
