import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import { otpServices } from "./otp.services";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";

const send = safeAsync(async (req: Request, res: Response) => {
  await otpServices.send(req);
  resHandler(res, {
    success: true,
    message: message("success", "sending OTP"),
    status: StatusCodes.OK,
  });
});

const verify = safeAsync(async (req: Request, res: Response) => {
  await otpServices.verify(req);
  resHandler(res, {
    success: true,
    message: message("success", "OTP verification"),
    status: StatusCodes.OK,
  });
});

export const otpControllers = {
  send,
  verify,
};
