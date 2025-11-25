import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { Riders } from "../rider/rider.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import {
  CreateRideDTO,
  UpdateRideCancelDTO,
  UpdateRideStatusDTO,
} from "./ride.types";
import { Rides } from "./ride.models";
import { geo } from "../../utils/geo";
import { Driver, DriverDocument, Drivers } from "../driver/driver.models";
import { validateDriver } from "../driver/driver.helpers/validateDriver";
import { withTransaction } from "../../database/transaction";
import { Types } from "mongoose";

const createRide = async (req: Request) => {
  const userId = (req.user as JWTCredentialProps).credentialId;
  const payload = req.body as CreateRideDTO;

  // Find rider profile
  const rider = await Riders.findOne({ user: userId });
  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }

  // Calculate the distance dynamically
  const distanceKm = geo.calculateDistanceKm({
    pickup: {
      lat: payload.pickup.lat,
      lng: payload.pickup.lng,
    },
    destination: {
      lat: payload.destination.lat,
      lng: payload.destination.lng,
    },
  });

  const updatedPayload = {
    rider: userId,
    status: "REQUESTED",
    distanceKm,
    ...payload,
  };

  const ride = await Rides.create(updatedPayload);
  return ride;
};
const updateAccept = async (req: Request) => {
  return withTransaction(async (session) => {
    const rideId = req.params.rideId;

    const { credentialId: driverId } = req.user as JWTCredentialProps;

    // Find the ride info
    const ride = await Rides.findById(rideId);
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }
    // Find driver profile
    const driver = (await Drivers.findById(driverId)) as DriverDocument;
    validateDriver(driver);

    if (!driver.isOnline) {
      throw new AppError(
        message("inactivated", "online status"),
        StatusCodes.BAD_REQUEST
      );
    }

    // Calculate the ETA (Estimated time arrival) dynamically
    const driverEta = geo.calculateEtaMinutes({
      driver: {
        lat: 123.1231,
        lng: 134123.0,
      },
      pickup: {
        lat: ride.pickup.lat,
        lng: ride.pickup.lng,
      },
    });

    ride.status = "ACCEPTED";
    ride.driver = driverId as unknown as Types.ObjectId;
    ride.acceptedAt = new Date();
    ride.driverEta = driverEta;

    driver.isAvailable = false;

    await ride.save({ session });
    await driver.save({ session });
    return { ride, driver };
  });
};
const updateCancel = async (req: Request) => {
  return withTransaction(async (session) => {
    const rideId = req.params.rideId;
    const payload = req.body as UpdateRideCancelDTO;
    const { role, credentialId } = req.user as JWTCredentialProps;

    const ride = await Rides.findById(rideId);
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }

    let driver = null;
    if (ride.driver) {
      driver = (await Drivers.findById(ride.driver)) as DriverDocument;
      validateDriver(driver);
    }

    // Rider authorization
    if (role === "RIDER" && credentialId !== ride.rider.toString()) {
      throw new AppError(
        message("forbidden", "Canceling ride"),
        StatusCodes.FORBIDDEN
      );
    }

    // Driver authorization
    if (
      role === "DRIVER" &&
      (!ride.driver || credentialId !== ride.driver.toString())
    ) {
      throw new AppError(
        message("forbidden", "Canceling ride"),
        StatusCodes.FORBIDDEN
      );
    }

    // Driver cannot cancel after pickup
    if (
      role === "DRIVER" &&
      ["PICKED_UP", "IN_TRANSIT", "COMPLETED"].includes(ride.status)
    ) {
      throw new AppError(
        message("forbidden", "Cannot cancel at this stage"),
        StatusCodes.FORBIDDEN
      );
    }

    const report = await Reports.findOne({ ride: ride._id });

    // Admin must give cancel reason
    if (["ADMIN", "SUPERADMIN"].includes(role) && !report) {
      throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
    }

    // Proceed with cancellation
    ride.canceledAt = new Date();
    ride.cancelReason = payload.cancelReason;
    ride.canceledBy = role;
    ride.status = "CANCELED";

    await ride.save({ session });

    // Free driver
    if (driver) {
      driver.isAvailable = true;
      await driver.save({ session });
    }

    return { ride };
  });
};

const updateStatus = async (req: Request) => {
  const rideId = req.params.rideId;
  const payload = req.body as UpdateRideStatusDTO;

  const ride = await Rides.findById(rideId);
  if (!ride) {
    throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
  }
  const driver = (await Drivers.findById(ride.driver)) as Driver;
  validateDriver(driver);

  ride.status = payload.status;
  await ride.save();

  return ride;
};
const retrieveHistories = async (req: Request) => {
  const { role, credentialId } = req.user as JWTCredentialProps;

  if (role === "DRIVER") {
    const rides = await Rides.find({ driver: credentialId });
    return rides;
  } else {
    const rides = await Rides.find({ rider: credentialId });
    return rides;
  }
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const retrieveRides = async (_req: Request) => {
  const rides = await Rides.find();
  return rides;
};

export const rideServices = {
  updateAccept,
  updateCancel,
  createRide,
  updateStatus,
  retrieveHistories,
  retrieveRides,
};
