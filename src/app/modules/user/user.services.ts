import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import bcryptjs from "bcryptjs";
import {
  AuthProviderDTO,
  CreateUserDTO,
  DeleteUserDTO,
  UpdateUserDTO,
} from "./user.types";
import AppError from "../../helpers/error.helper";
import { User, Users } from "./user.models";
import environments from "../../configurations/environments";
import { validateUser } from "./user.helpers/validateUser";
import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { withTransaction } from "../../database/transaction";
import { Riders } from "../rider/rider.models";
import { Drivers } from "../driver/driver.models";
import { FileProps } from "../../types/global.types";

// ✅ Create new user
const createUser = async (req: Request) => {
  return withTransaction(async (session) => {
    const { email, password, ...rest } = req.body as CreateUserDTO;

    const avatar = {
      url: req.file?.path,
      publicId: req.file?.filename,
    } as FileProps;
    // Find user profile
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

    const authProvider = {
      provider: "CREDENTIAL",
      providerId: email,
    } as AuthProviderDTO;

    // Roll-back for creating user and rider simultaneously.
    const latestUser = await Users.create(
      [
        {
          email,
          ...rest,
          auths: [authProvider],
          password: hashPassword,
          ...(req.file?.path && { avatar }),
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
  const userId = req.params.userId;
  const user = await Users.findById(userId);

  if (!user) {
    throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
  }

  return user;
};

// ✅ Update user
const updateUser = async (req: Request) => {
  const userId = req.params.userId;
  const { role, credentialId } = req.user as JWTCredentialProps;
  const payload = req.body as UpdateUserDTO;

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
    if (payload.status && payload.status !== user.status) {
      throw new AppError(
        message("forbidden", "update status"),
        StatusCodes.FORBIDDEN
      );
    }

    if (payload.role && payload.role !== role) {
      throw new AppError(message("forbidden", role), StatusCodes.FORBIDDEN);
    }
  }
  // ADMIN restrictions
  if (role === "ADMIN" && payload.role === "SUPERADMIN") {
    throw new AppError(
      message("forbidden", "ADMIN (cannot assign SUPERADMIN)"),
      StatusCodes.FORBIDDEN
    );
  }

  const updateUser = await Users.findByIdAndUpdate(userId, payload, {
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
  return withTransaction(async (session) => {
    const userId = req.params.userId;
    const { role, credentialId } = req.user as JWTCredentialProps;
    const payload = req.body as DeleteUserDTO;

    const user = await Users.findById(userId);

    if (!user) {
      throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
    }

    // Only require password if deleting own account
    if (credentialId === userId) {
      if (!payload.confirmPassword) {
        throw new AppError(
          message("notFound", "confirm password"),
          StatusCodes.NOT_FOUND
        );
      }

      const credential = await Users.findById(credentialId).select("+password");

      const hasCredentialAuth = credential?.auths.find(
        (auth: AuthProviderDTO) => auth.provider === "CREDENTIAL"
      );

      if (hasCredentialAuth) {
        const verifyPassword = await bcryptjs.compare(
          payload.confirmPassword as string,
          credential?.password as string
        );
        if (!verifyPassword) {
          throw new AppError(
            message("badRequest", "Matching password"),
            StatusCodes.BAD_REQUEST
          );
        }
      }
    }

    // Prevent redundant action
    if (user.isDeleted) {
      throw new AppError(
        message("alreadyExists", "deleting status"),
        StatusCodes.BAD_REQUEST
      );
    }

    // ADMIN restrictions
    if (role === "ADMIN" && user.role === "SUPERADMIN") {
      throw new AppError(
        message("forbidden", "delete", "ADMIN (cannot delete SUPERADMIN)"),
        StatusCodes.FORBIDDEN
      );
    }
    if (["RIDER", "DRIVER"].includes(role) && credentialId !== userId) {
      throw new AppError(
        message("forbidden", "delete", `${role} cannot delete other user`),
        StatusCodes.FORBIDDEN
      );
    }

    // If deleting driver, deactivate driver record
    if (user.role === "DRIVER") {
      await Drivers.findOneAndUpdate(
        { user: userId },
        {
          isActivated: false,
          isApproved: false,
          isAvailable: false,
          isOnline: false,
        },
        { session, runValidators: true }
      );
    }

    const deletedUser = await Users.findByIdAndUpdate(
      userId,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: credentialId,
        deletedReason: payload.deletedReason,
      },
      {
        runValidators: true,
        new: true,
        session,
      }
    );
    return deletedUser;
  });
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
