import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import { Riders } from "../rider/rider.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { CreateRideDTO } from "./ride.types";
import { Rides } from "./ride.models";
import { geo } from "../../utils/geo";

const createRide = async (req: Request) => {
  const userId = (req.user as JWTCredentialProps).credentialId;
  const payload = req.body as CreateRideDTO;

  // Find rider profile
  const rider = Riders.findOne({ user: userId });
  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }

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
  const driverEta = geo.calculateEtaMinutes({
    driver: {
      lat: 123.1231,
      lng: 134123.0,
    },
    pickup: {
      lat: payload.pickup.lat,
      lng: payload.pickup.lng,
    },
  });

  const updatedPayload = {
    rider: userId,
    status: "REQUESTED",
    distanceKm,
    driverEta,
    ...payload,
  };

  const ride = Rides.create(updatedPayload);
  return ride;
};
const updateAccept = async (req: Request) => {
  const {
    params: { rideId },
    user: { credentialId: driverId },
    body: payload,
  } = req;

  // Find the ride info
  const ride = await Rides.findById(rideId);
  if (!ride) {
    throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
  }
};
const updateCancel = async (req: Request) => {};
const updateStatus = async (req: Request) => {};
const retrieveHistories = async (req: Request) => {};
const retrieveRides = async (req: Request) => {};

export const rideServices = {
  updateAccept,
  updateCancel,
  createRide,
  updateStatus,
  retrieveHistories,
  retrieveRides,
};
