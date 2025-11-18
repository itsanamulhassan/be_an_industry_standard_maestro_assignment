import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import bcryptjs from "bcryptjs";
import { AuthProviderDTO, CreateUserDTO } from "./user.types";
import AppError from "../../helpers/error.helper";
import { User, Users } from "./user.models";
import environments from "../../configurations/environments";
import { validateUser } from "./user.helpers/validateUser";
import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { withTransaction } from "../../database/transaction";
import { Riders } from "../rider/rider.models";

// ✅ Create new user
const createUser = async (payload: CreateUserDTO) => {
  return withTransaction(async (session) => {
    const { email, password, ...rest } = payload as CreateUserDTO;

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

    const authProvider: AuthProviderDTO = {
      provider: "CREDENTIAL",
      providerId: email,
    };
    const latestUser = await Users.create(
      [
        {
          email,
          ...rest,
          auths: [authProvider],
          password: hashPassword,
        },
      ],
      { session }
    );
    await Riders.create(
      [
        {
          user: latestUser[0]._id,
        },
      ],
      { session }
    );
    return latestUser;
  });
};

// ✅ Retrieve users
const retrieveUsers = async () => {
  const users = await Users.find();

  if (!users.length) {
    throw new AppError(message("notFound", "users"), StatusCodes.NOT_FOUND);
  }

  return users;
};
// ✅ Retrieve user
const retrieveUser = async (req: Request) => {
  const user = await Users.findById(req.params.id);

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  return user;
};

// ✅ Update user
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
    if (body.status && body.status !== user.status) {
      throw new AppError(
        message("forbidden", "update status"),
        StatusCodes.FORBIDDEN
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

// ✅ Retrieve user by Credential
const retrieveMe = async (req: Request) => {
  const credential = req.user as JWTCredentialProps;
  const user = await Users.findById(credential.credentialId);

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }
  return user;
};
// ✅ Delete user
const deleteUser = async (req: Request) => {
  const id = req.params.id;
  const credential = req.user as JWTCredentialProps;

  const user = await Users.findById(id);
  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  // ADMIN restrictions
  if (credential.role === "ADMIN" && user.role === "SUPERADMIN") {
    throw new AppError(
      message("forbidden", "delete", "ADMIN (cannot delete SUPERADMIN)"),
      StatusCodes.FORBIDDEN
    );
  }
  if (
    ["RIDER", "DRIVER"].includes(credential.role) &&
    credential.credentialId !== user._id.toString()
  ) {
    throw new AppError(
      message(
        "forbidden",
        "delete",
        `${credential.role} cannot delete other user`
      ),
      StatusCodes.FORBIDDEN
    );
  }

  await Users.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
    },
    {
      runValidators: true,
      new: true,
    }
  );
};

const userServices = {
  createUser,
  retrieveUsers,
  updateUser,
  retrieveMe,
  deleteUser,
  retrieveUser,
};

export default userServices;
