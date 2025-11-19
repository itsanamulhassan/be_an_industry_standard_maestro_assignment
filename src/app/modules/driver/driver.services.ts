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

const createDriver = async (req: Request) => {
  const payload = req.body as CreateDriverDTO;
  const id = req.params.id;

  const user = (await Users.findById(id)) as User;
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

  const latestDriver = await Drivers.create(payload);
  return latestDriver;
};

const updateDriver = async (req: Request) => {
  const payload = req.body as UpdateDriverDTO;
  const id = req.params.id; // id is representing the user id
  const user = (await Users.findById(id)) as User;
  validateUser(user);
  const driver = await Drivers.findOne({ user: id });
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }
  return await Drivers.findOneAndUpdate(
    { user: id },
    {
      vehicleInfo: payload.vehicleInfo,
      licenseNumber: payload.licenseNumber,
    },
    { runValidators: true, new: true }
  );
};
const updateOnline = async (req: Request) => {
  const payload = req.body as UpdateDriverOnlineDTO;
  const id = req.params.id;

  const user = (await Users.findById(id)) as User;
  validateUser(user);
  const driver = await Drivers.findOne({ user: id });
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }
  if (!driver.isApproved || user.role !== "DRIVER") {
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

  const user = (await Users.findById(id)) as User;
  validateUser(user);
  const driver = await Drivers.findOne({ user: id });
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }
  if (!driver.isApproved || user.role !== "DRIVER") {
    throw new AppError(
      message("unauthorized", "driver"),
      StatusCodes.UNAUTHORIZED
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
    const id = req.params.id;
    const user = (await Users.findById(id)) as User;
    validateUser(user);
    const driver = await Drivers.findOne({ user: id });
    if (!driver) {
      throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
    }
    if (!driver.licenseNumber) {
      throw new AppError(
        message("notFound", "license number"),
        StatusCodes.NOT_FOUND
      );
    }
    if (!driver.vehicleInfo) {
      throw new AppError(
        message("notFound", "vehicle information"),
        StatusCodes.NOT_FOUND
      );
    }
    if (payload.isApproved) {
      await Users.findByIdAndUpdate(
        id,
        {
          role: "DRIVER",
        },
        { runValidators: true, session }
      );
    }
    return Drivers.findOneAndUpdate(
      { user: id },
      {
        isApproved: payload.isApproved,
      },
      { runValidators: true, new: true, session }
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
