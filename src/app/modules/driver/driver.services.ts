import { Request } from "express";
import {
  CreateDriverDTO,
  UpdateDriverActivationDTO,
  UpdateDriverApprovalDTO,
  UpdateDriverDTO,
  UpdateDriverOnlineDTO,
} from "./driver.types";
import { Drivers } from "./driver.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { User, Users } from "../user/user.models";
import { validateUser } from "../user/user.helpers/validateUser";
import { withTransaction } from "../../database/transaction";
import { JWTCredentialProps } from "../../types/utils.types";

const createDriver = async (req: Request) => {
  const payload = req.body as CreateDriverDTO;
  const id = req.params.id;

  const user = (await Users.findById(id)) as User;

  if ((req.user as JWTCredentialProps).role === "RIDER") {
    if (["ADMIN", "SUPERADMIN"].includes(user.role)) {
      throw new AppError(
        message("unauthorized", "user"),
        StatusCodes.UNAUTHORIZED
      );
    }
  }
  if (["ADMIN", "SUPERADMIN"].includes(user.role)) {
    throw new AppError(
      message("forbidden", user.role.toUpperCase()),
      StatusCodes.FORBIDDEN
    );
  }
  validateUser(user);

  const driver = await Drivers.findOne({ user: id });
  if (driver) {
    throw new AppError(
      message("alreadyExists", "driver"),
      StatusCodes.BAD_REQUEST
    );
  }

  const latestDriver = await Drivers.create({
    user: id,
    ...payload,
  });
  return latestDriver;
};

const updateDriver = async (req: Request) => {
  const payload = req.body as UpdateDriverDTO;
  const id = req.params.id; // id is representing the user id

  // Find user profile
  const user = (await Users.findById(id)) as User;

  // Check valid user
  validateUser(user);

  // Find driver profile
  const driver = await Drivers.findOne({ user: id });

  // Check is DRIVER user ID & requested ID is same for DRIVER role
  if (
    (req.user as JWTCredentialProps).role === "DRIVER" &&
    (req.user as JWTCredentialProps).credentialId !== id
  ) {
    throw new AppError(
      message("unauthorized", "user"),
      StatusCodes.UNAUTHORIZED
    );
  }

  // Check is driver exist
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }

  // Check if any critical fields changed
  const vehicleChanged =
    payload.vehicleInfo &&
    JSON.stringify(payload.vehicleInfo) !== JSON.stringify(driver.vehicleInfo);

  const licenseChanged =
    payload.licenseNumber && payload.licenseNumber !== driver.licenseNumber;

  if (vehicleChanged || licenseChanged) {
    return await Drivers.findOneAndUpdate(
      { user: id },
      {
        isActivated: false,
        isApproved: false,
        pendingReview: true,
        pendingChanges: payload,
        ...(driver.isOnline && { isOnline: false }),
      },
      { runValidators: true, new: true }
    );
  }
};
const updateOnline = async (req: Request) => {
  const payload = req.body as UpdateDriverOnlineDTO;
  const id = req.params.id;

  // Find user profile
  const user = (await Users.findById(id)) as User;
  validateUser(user);

  // Find driver profile
  const driver = await Drivers.findOne({ user: id });

  // Avoid redundant updates
  if (driver?.isOnline === payload.isOnline) {
    throw new AppError(
      message("alreadyExists", "online status"),
      StatusCodes.BAD_REQUEST
    );
  }
  // Check is driver exist
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }

  // Check is DRIVER user ID & requested ID is same for DRIVER role
  if (
    (req.user as JWTCredentialProps).role === "DRIVER" &&
    (req.user as JWTCredentialProps).credentialId !== id
  ) {
    throw new AppError(
      message("unauthorized", "user"),
      StatusCodes.UNAUTHORIZED
    );
  }
  if (!driver.isApproved || user.role !== "DRIVER" || !driver.isActivated) {
    throw new AppError(
      message("unauthorized", "driver"),
      StatusCodes.UNAUTHORIZED
    );
  }
  return await Drivers.findOneAndUpdate(
    { user: id },
    {
      isOnline: payload.isOnline,
    },
    { runValidators: true, new: true }
  );
};
const updateActivation = async (req: Request) => {
  const payload = req.body as UpdateDriverActivationDTO;
  const id = req.params.id;

  // Find user profile
  const user = (await Users.findById(id)) as User;
  validateUser(user);

  // Find driver profile
  const driver = await Drivers.findOne({ user: id });

  // Check is driver exist
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }

  //  Ensure the target user is actually a driver
  if (user.role !== "DRIVER") {
    throw new AppError(
      message("forbidden", "target user is not a driver"),
      StatusCodes.FORBIDDEN
    );
  }

  // Driver must be approved first
  if (!driver.isApproved) {
    throw new AppError(
      message("unauthorized", "driver is not approved"),
      StatusCodes.UNAUTHORIZED
    );
  }

  // Avoid redundant updates
  if (driver.isActivated === payload.isActivated) {
    throw new AppError(
      message("alreadyExists", "activation status"),
      StatusCodes.BAD_REQUEST
    );
  }

  return await Drivers.findOneAndUpdate(
    { user: id },
    {
      isActivated: payload.isActivated,
    },
    { runValidators: true, new: true }
  );
};

const updateApproval = async (req: Request) => {
  return withTransaction(async (session) => {
    const payload = req.body as UpdateDriverApprovalDTO;
    const userId = req.params.id;

    const user = (await Users.findById(userId)) as User;
    validateUser(user);

    const driver = await Drivers.findOne({ user: userId });
    if (!driver) {
      throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
    }

    // Prevent useless updates
    if (driver.isApproved === payload.isApproved) {
      throw new AppError(
        message("alreadyExists", "approval status"),
        StatusCodes.BAD_REQUEST
      );
    }

    // APPROVAL (TRUE)
    if (payload.isApproved) {
      // Ensure required fields exist
      if (!driver.licenseNumber) {
        throw new AppError(
          message("notFound", "license number"),
          StatusCodes.BAD_REQUEST
        );
      }

      if (!driver.vehicleInfo) {
        throw new AppError(
          message("notFound", "vehicle information"),
          StatusCodes.BAD_REQUEST
        );
      }

      // Update user role to DRIVER after approved
      await Users.findByIdAndUpdate(
        userId,
        { role: "DRIVER" },
        { session, runValidators: true }
      );
    } else {
      // DISAPPROVAL (FALSE) → Driver loses privileges
      await Users.findByIdAndUpdate(
        userId,
        { role: "RIDER" },
        { session, runValidators: true }
      );
    }

    // CASE 1: Re-approval (pending changes)
    if (driver.pendingReview && driver.pendingChanges) {
      return Drivers.findOneAndUpdate(
        { user: userId },
        {
          isApproved: payload.isApproved,
          pendingReview: false,
          pendingChanges: null,

          ...(driver.pendingChanges.licenseNumber && {
            licenseNumber: driver.pendingChanges.licenseNumber,
          }),
          ...(driver.pendingChanges.vehicleInfo && {
            vehicleInfo: driver.pendingChanges.vehicleInfo,
          }),
        },
        { session, new: true, runValidators: true }
      );
    }

    // CASE 2: Normal approval/disapproval
    return Drivers.findOneAndUpdate(
      { user: userId },
      {
        isApproved: payload.isApproved,
        pendingReview: false,
      },
      { session, new: true, runValidators: true }
    );
  });
};

export const driverServices = {
  createDriver,
  updateDriver,
  updateOnline,
  updateApproval,
  updateActivation,
};
