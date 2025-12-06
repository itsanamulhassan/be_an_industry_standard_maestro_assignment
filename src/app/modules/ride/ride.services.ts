import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { PaymentMethod, Rider, Riders } from "../rider/rider.models";
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
import { CreateStripeIntentProps } from "../payment/payment.types";
import { User } from "../user/user.models";
import { paymentServices } from "../payment/payment.services";

// ✅ Create ride
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
    rider: rider._id.toString(),
    status: "REQUESTED",
    distanceKm,
    fare,
    ...payload,
  });

  return ride;
};

// ✅ Update ride
const updateAccept = async (req: Request) => {
  return withTransaction(async (session) => {
    const rideId = req.params.rideId;

    const { credentialId: userId } = req.user as JWTCredentialProps;

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
    if (ride.status !== "REQUESTED") {
      throw new AppError(
        message(
          "badRequest",
          "ride status",
          "You can't accept the ride in this stage."
        ),
        StatusCodes.BAD_REQUEST
      );
    }

    // Find driver profile
    const driver = (await Drivers.findOne({
      user: userId,
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
        lat: 51.523774,
        lng: -0.158538,
      },
      pickup: {
        lat: ride.pickup.lat,
        lng: ride.pickup.lng,
      },
    });

    ride.status = "ACCEPTED";
    ride.driver = driver._id;
    ride.acceptedAt = new Date();
    ride.driverEta = driverEta;

    driver.isAvailable = false;

    await ride.save({ session });
    await driver.save({ session });
    return { ride, driver };
  });
};

// ✅ Update cancel
const updateCancel = async (req: Request) => {
  return withTransaction(async (session) => {
    const rideId = req.params.rideId;
    const payload = req.body as UpdateRideCancelDTO;
    const { role, credentialId } = req.user as JWTCredentialProps;

    const ride = await Rides.findById(rideId)
      .populate("rider")
      .session(session);
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }

    let driver = null;
    if (ride.driver) {
      driver = (await Drivers.findById(ride.driver).session(
        session
      )) as DriverDocument;
      validateDriver(driver);
    }

    if (ride.status === "CANCELED") {
      throw new AppError(
        message(
          "alreadyExists",
          "ride status",
          "Ride status already canceled."
        ),
        StatusCodes.BAD_REQUEST
      );
    }

    // Rider authorization
    if (
      role === "RIDER" &&
      credentialId !== (ride.rider as unknown as Rider).user.toString()
    ) {
      throw new AppError(
        message("forbidden", "Canceling ride"),
        StatusCodes.FORBIDDEN
      );
    }

    // Driver authorization
    if (
      role === "DRIVER" &&
      (!ride.driver ||
        credentialId !== (driver as unknown as Driver).user.toString())
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
// ✅ Update status
const updateStatus = async (req: Request) => {
  return withTransaction(async (session) => {
    const rideId = req.params.rideId;
    const payload = req.body as UpdateRideStatusDTO;
    const { credentialId: userId } = req.user as JWTCredentialProps;

    const ride = (await Rides.findById(rideId)
      .populate("driver")
      .session(session)) as RideDocument;
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }

    if (
      ride.driver &&
      (ride.driver as unknown as Driver).user.toString() !== userId
    ) {
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
    if (payload.status === "PAYMENT_PENDING" && ride.status !== "IN_TRANSIT") {
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

    const driver = (await Drivers.findOne({
      user: userId,
    }).session(session)) as DriverDocument;
    validateDriver(driver);

    if (payload.status === "PAYMENT_PENDING") {
      const rider = await Riders.findById(ride.rider).populate({
        path: "user",
        select: "email",
      });

      const defaultPaymentMethod = rider?.paymentMethods.find(
        (method: PaymentMethod) => method.isDefault
      ) as PaymentMethod;

      const intentPayload = {
        amount: ride.fare,
        email: (rider?.user as unknown as User).email,
        driver: ride.driver._id.toString(),
        ride: ride._id.toString(),
        rider: ride.rider.toString(),
        method: defaultPaymentMethod.type,
      } as CreateStripeIntentProps;

      const intent = await paymentServices.createStripeIntent(intentPayload);
      ride.payment = intent.payment._id;
      ride.status = "PAYMENT_PENDING";
    }
    if (payload.status === "PICKED_UP") ride.pickedUpAt = new Date();

    await ride.save({ session });
    await driver.save({ session });

    return ride;
  });
};

// ✅ Get histories (RIDER, DRIVER)
const listHistories = async (req: Request) => {
  const { role, credentialId: userId } = req.user as JWTCredentialProps;

  const lookupCollection = role === "DRIVER" ? "drivers" : "riders";
  const localField = role === "DRIVER" ? "driver" : "rider";

  // 2. Perform a single database aggregation operation
  const rides = await Rides.aggregate([
    // STAGE 1: Join 'Rides' with the appropriate 'drivers' or 'riders' collection
    {
      $lookup: {
        from: lookupCollection,
        localField: localField,
        foreignField: "_id",
        as: "userInfo",
      },
    },

    // // STAGE 2: Deconstruct the array created by $lookup
    { $unwind: "$userInfo" },

    // // STAGE 3: Filter the rides where the joined Driver/Rider
    {
      $match: {
        "userInfo.user": new Types.ObjectId(userId),
      },
    },

    // // STAGE 4: Clean up the result by removing the joined driverInfo object
    { $project: { userInfo: 0 } },
  ]);

  return rides;
};
// ✅ Get histories (RIDER, DRIVER)
const getHistory = async (req: Request) => {
  const { role, credentialId: userId } = req.user as JWTCredentialProps;
  const rideId = req.params.rideId;

  const lookupCollection = role === "DRIVER" ? "drivers" : "riders";
  const localField = role === "DRIVER" ? "driver" : "rider";

  // 2. Perform a single database aggregation operation
  const ride = await Rides.aggregate([
    {
      $match: { _id: new Types.ObjectId(rideId) },
    },
    // STAGE 1: Join 'Rides' with the appropriate 'drivers' or 'riders' collection
    {
      $lookup: {
        from: lookupCollection,
        localField: localField,
        foreignField: "_id",
        as: "userInfo",
      },
    },

    // // STAGE 2: Deconstruct the array created by $lookup
    { $unwind: "$userInfo" },

    // // STAGE 3: Filter the rides where the joined Driver/Rider
    {
      $match: {
        "userInfo.user": new Types.ObjectId(userId),
      },
    },

    // // STAGE 4: Clean up the result by removing the joined driverInfo object
    { $project: { userInfo: 0 } },
  ]);

  return ride;
};

// ✅ List rides (ADMIN, SUPERADMIN)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listRides = async (_req: Request) => {
  const rides = await Rides.find();
  return rides;
};

// Get ride by rideId (ADMIN, SUPERADMIN)
const getRide = async (req: Request) => {
  const rideId = req.params.rideId;
  const ride = await Rides.findById(rideId);
  if (!ride) {
    throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
  }
  return ride;
};

export const rideServices = {
  updateAccept,
  updateCancel,
  createRide,
  updateStatus,
  listHistories,
  listRides,
  getRide,
  getHistory,
};
