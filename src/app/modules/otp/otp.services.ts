import { Request } from "express";
import { SendOTPDto, VerifyOTPDto } from "./otp.types";
import { Users } from "../user/user.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { generateOTP } from "../../utils/generateOTP";
import { client } from "../../configurations/redis";
import mailSender from "../../utils/mailSender";

const send = async (req: Request) => {
  const payload: SendOTPDto = req.body;

  const user = await Users.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }
  if (user.isVerified) {
    throw new AppError(
      message("alreadyExists", "verification"),
      StatusCodes.BAD_REQUEST
    );
  }

  const otp = generateOTP();

  await client.set(`OTP:${payload.email}`, otp, {
    expiration: {
      type: "EX",
      value: 2 * 60,
    },
  });

  await mailSender({
    subject: "Account Verification OTP",
    template: "otp",
    to: payload.email,
    data: {
      name: user.name,
      otp,
    },
  });
};
const verify = async (req: Request) => {
  const payload: VerifyOTPDto = req.body;

  const user = await Users.findOne({ email: payload.email });

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  if (user.isVerified) {
    throw new AppError(
      message("alreadyExists", "OTP verification"),
      StatusCodes.BAD_REQUEST
    );
  }

  const key = `OTP:${payload.email}`;

  const otp = await client.get(key);

  if (!otp) {
    throw new AppError(message("expired", "otp"), StatusCodes.NOT_FOUND);
  }

  if (otp !== payload.otp) {
    throw new AppError(message("expired", "otp"), StatusCodes.NOT_FOUND);
  }

  await Promise.all([
    Users.updateOne(
      { email: payload.email },
      { isVerified: true, emailVerifiedAt: new Date() },
      {
        runValidators: true,
      }
    ),
    client.del([key]),
  ]);
};

export const otpServices = {
  send,
  verify,
};
