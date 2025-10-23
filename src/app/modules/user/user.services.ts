import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import bcryptjs from "bcryptjs";
import { AuthProviderDto, CreateUserDto } from "./user.types";
import AppError from "../../helpers/error.helper";
import { User, Users } from "./user.models";
import environments from "../../configurations/environments";
import { validateUser } from "./user.helpers/validateUser";
import { Request } from "express";
import { JWTCredentialProps } from "../../types/express";

const createUser = async (payload: CreateUserDto) => {
  const { email, password, ...rest } = payload as CreateUserDto;

  const user = await Users.findOne({ email });
  if (user) {
    throw new AppError(
      message("alreadyExists", "user"),
      StatusCodes.BAD_REQUEST
    );
  }

  const hashPassword = await bcryptjs.hash(
    password as string,
    environments.bcrypt_salt_round
  );

  const authProvider: AuthProviderDto = {
    provider: "CREDENTIAL",
    providerId: email,
  };
  return await Users.create({
    email,
    ...rest,
    auths: [authProvider],
    password: hashPassword,
  });
};

const retrieveUsers = async () => {
  const users = await Users.find();

  return users;
};

const updateUser = async (req: Request) => {
  const {
    params: { id: userId },
    user: { role, credentialId },
    body,
  } = req as Request & { user: JWTCredentialProps };

  const user = (await Users.findById(userId)) as User;
  validateUser(user);

  //   ADMIN restrictions
  if (role === "ADMIN" && user.role === "SUPERADMIN") {
    throw new AppError(
      message("unauthorized", "user"),
      StatusCodes.BAD_REQUEST
    );
  }

  // USER or GUIDE restrictions
  if (["RIDER", "DRIVER"].includes(role)) {
    if (userId !== credentialId) {
      throw new AppError(
        message("unauthorized", "user"),
        StatusCodes.BAD_REQUEST
      );
    }
    if (body.role && body.role !== role) {
      throw new AppError(message("forbidden", role), StatusCodes.FORBIDDEN);
    }
  }
  // ADMIN restrictions
  if (role === "ADMIN" && body.role === "SUPERADMIN") {
    throw new AppError(
      message("forbidden", "ADMIN (cannot assign SUPERADMIN)"),
      StatusCodes.FORBIDDEN
    );
  }

  if (body.password) {
    body.password = await bcryptjs.hash(
      body.password,
      environments.bcrypt_salt_round
    );
  }
  const updateUser = await Users.findByIdAndUpdate(userId, body, {
    new: true,
    runValidators: true,
  });
  return updateUser;
};

const retrieveMe = async (req: Request) => {
  const id = req.user;
};

const userServices = {
  createUser,
  retrieveUsers,
  updateUser,
  retrieveMe,
};

export default userServices;
