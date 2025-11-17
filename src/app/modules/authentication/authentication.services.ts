import { NextFunction, Request, Response } from "express";
import passport from "passport";
import { UserDocument, Users } from "../user/user.models";
import AppError from "../../helpers/error.helper";
import { StatusCodes } from "http-status-codes";
import { validateUser } from "../user/user.helpers/validateUser";
import { token } from "../../utils/token";
import { cookies } from "../../utils/cookies";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { JwtPayload } from "jsonwebtoken";
import { SetPasswordDTO } from "./authentication.types";
import { AuthProviderDTO } from "../user/user.types";
import { Types } from "mongoose";
import environments from "../../configurations/environments";
import bcrypt from "bcryptjs";
import mailSender from "../../utils/mailSender";
import JWT from "jsonwebtoken";

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
const setPassword = async (req: Request) => {
  const userId = (req.user as JwtPayload).credentialId;
  const payload = req.body as SetPasswordDTO;

  const user = (await Users.findById(userId).select([
    "password",
    "auths",
    "email",
  ])) as UserDocument;

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }
  if (
    user?.password &&
    user?.auths.some((auth: AuthProviderDTO) => auth.provider === "CREDENTIAL")
  ) {
    throw new AppError(
      message("alreadyExists", "password"),
      StatusCodes.BAD_REQUEST
    );
  }
  const updateAuths = [
    ...user.auths,
    {
      provider: "CREDENTIAL",
      providerId: user?.email,
    },
  ] as Types.DocumentArray<AuthProviderDTO>;

  const hash = await bcrypt.hash(
    payload.password,
    environments.bcrypt_salt_round
  );

  user.password = hash;
  user.auths = updateAuths;

  user.save();
};

const forgetPassword = async (req: Request) => {
  const { email } = req.body;

  const user = await Users.findOne({ email }).select([
    "_id",
    "name",
    "role",
    "email",
    "status",
    "isDeleted",
    "isVerified",
  ]);
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.BAD_REQUEST);
  }
  validateUser(user);

  const token = JWT.sign(
    req.user as JwtPayload,
    environments.jwt.access_secret,
    {
      expiresIn: "10m",
    }
  );
  const link = `${environments.frontend_base_url}/forget_password?id=${user._id}&token=${token}`;

  mailSender({
    to: user?.email as string,
    template: "resetPassword",
    subject: "Forget Password",
    data: { name: user?.name, link },
  });
};
const resetPassword = async (req: Request) => {
  const credentialId = (req.user as JwtPayload).credentialId;
  const { id, password } = req.body;

  if (id !== credentialId) {
    throw new AppError(message("expired", "token"), StatusCodes.BAD_REQUEST);
  }
  const user = await Users.findById(id);
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  const hash = await bcrypt.hash(
    password,
    Number(environments.bcrypt_salt_round)
  );
  user.password = hash;
  await user.save();
};
const changePassword = async (req: Request) => {
  const userId = (req.user as JwtPayload).credentialId;
  const { previousPassword, latestPassword } = req.body;
  const user = (await Users.findById(userId).select(
    "+password"
  )) as UserDocument;
  validateUser(user);

  const isMatch = await bcrypt.compare(
    previousPassword,
    user.password as string
  );
  if (!isMatch) {
    throw new AppError(
      message("badRequest", "change password"),
      StatusCodes.BAD_REQUEST
    );
  }
  user.password = await bcrypt.hash(
    latestPassword,
    environments.bcrypt_salt_round
  );
  user.save();
};
export const authenticationServices = {
  signIn,
  resetPassword,
  forgetPassword,
  setPassword,
  changePassword,
};
