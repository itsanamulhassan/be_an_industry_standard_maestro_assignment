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
import { RideDocument, Rides } from "./ride.models";
import { geo } from "../../utils/geo";
import { Driver, DriverDocument, Drivers } from "../driver/driver.models";
import { validateDriver } from "../driver/driver.helpers/validateDriver";
import { withTransaction } from "../../database/transaction";
import { Types } from "mongoose";
import { Reports } from "../report/report.models";

const createRide = async (req: Request) => {
  const userId = (req.user as JWTCredentialProps).credentialId;
  const payload = req.body as CreateRideDTO;

  // Find rider profile
  const rider = await Riders.findOne({ user: userId });
  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }

  // Block if the rider has an active ride
  const activeRide = await Rides.findOne({
    rider: userId,
    status: { $in: ["REQUESTED", "ACCEPTED", "PICKED_UP", "IN_TRANSIT"] },
  });

  if (activeRide) {
    throw new AppError(
      "You already have an active ride. Please wait until it is completed.",
      StatusCodes.BAD_REQUEST
    );
  }

  // Calculate distance dynamically
  const { distanceKm, durationMin } = await geo.calculateDistanceDuration({
    pickup: { lat: payload.pickup.lat, lng: payload.pickup.lng },
    destination: { lat: payload.destination.lat, lng: payload.destination.lng },
  });

  // Calculate fare with distance and duration
  const fare = geo.calculateFare({ distanceKm, durationMin });

  const ride = await Rides.create({
    rider: userId,
    status: "REQUESTED",
    distanceKm,
    fare,
    ...payload,
  });

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
    if (ride.status === "ACCEPTED") {
      throw new AppError(
        message(
          "alreadyExists",
          "ride status",
          "Ride status already accepted."
        ),
        StatusCodes.BAD_REQUEST
      );
    }
    // Find driver profile
    const driver = (await Drivers.findOne({
      user: driverId,
    })) as DriverDocument;
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
      throw new AppError(
        message(
          "notFound",
          "report",
          "You can't cancel the ride without report."
        ),
        StatusCodes.NOT_FOUND
      );
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
  const { credentialId } = req.user as JWTCredentialProps;

  const ride = (await Rides.findById(rideId)) as RideDocument;
  if (!ride) {
    throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
  }

  if (ride.driver && ride.driver.toString() !== credentialId) {
    throw new AppError(
      message("badRequest", "ride status", "You can't change the status."),
      StatusCodes.BAD_REQUEST
    );
  }

  if (payload.status === "PICKED_UP" && ride.status !== "ACCEPTED") {
    throw new AppError(
      message(
        "badRequest",
        "ride status",
        "You can't change the status picked up."
      ),
      StatusCodes.BAD_REQUEST
    );
  }

  if (payload.status === "IN_TRANSIT" && ride.status !== "PICKED_UP") {
    throw new AppError(
      message(
        "badRequest",
        "ride status",
        "You can't change the status in transit."
      ),
      StatusCodes.BAD_REQUEST
    );
  }
  if (payload.status === "COMPLETED" && ride.status !== "IN_TRANSIT") {
    throw new AppError(
      message(
        "badRequest",
        "ride status",
        "You can't change the status completed."
      ),
      StatusCodes.BAD_REQUEST
    );
  }
  if (["REQUESTED", "CANCELED"].includes(ride.status)) {
    throw new AppError(
      message(
        "badRequest",
        "ride status",
        "You can't update the status in this stage."
      ),
      StatusCodes.BAD_REQUEST
    );
  }

  const driver = (await Drivers.findOne({ user: credentialId })) as Driver;
  validateDriver(driver);

  ride.status = payload.status;
  if (payload.status === "COMPLETED") ride.completedAt = new Date();
  if (payload.status === "PICKED_UP") ride.pickedUpAt = new Date();

  await ride.save();

  return ride;
};
const getHistories = async (req: Request) => {
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
const listRides = async (_req: Request) => {
  const rides = await Rides.find();
  return rides;
};
const getRide = async (req: Request) => {
  const rideId = req.params.rideId;
  const ride = await Rides.findById(rideId);
  if (ride) {
    throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
  }
  return ride;
};

export const rideServices = {
  updateAccept,
  updateCancel,
  createRide,
  updateStatus,
  getHistories,
  listRides,
  getRide,
};
