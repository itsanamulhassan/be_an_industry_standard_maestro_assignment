import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import resHandler from "../../utils/resHandler";
import safeAsync from "../../utils/safeAsync";
import { Request, Response } from "express";
import { rideServices } from "./ride.services";

const createRide = safeAsync(async (req: Request, res: Response) => {
  const ride = await rideServices.createRide(req);
  resHandler(res, {
    message: message("create", "ride"),
    status: StatusCodes.CREATED,
    success: true,
    data: ride,
  });
});
const updateCancel = safeAsync(async (req: Request, res: Response) => {
  const ride = await rideServices.updateCancel(req);
  resHandler(res, {
    message: message("cancel", "ride"),
    status: StatusCodes.BAD_REQUEST,
    success: true,
    data: ride,
  });
});
const updateAccept = safeAsync(async (req: Request, res: Response) => {
  const ride = await rideServices.updateAccept(req);
  resHandler(res, {
    message: message("accept", "ride"),
    status: StatusCodes.ACCEPTED,
    success: true,
    data: ride,
  });
});

const updateStatus = safeAsync(async (req: Request, res: Response) => {
  const ride = await rideServices.updateStatus(req);
  resHandler(res, {
    message: message("update", "ride status"),
    status: StatusCodes.OK,
    success: true,
    data: ride,
  });
});

const retrieveHistories = safeAsync(async (req: Request, res: Response) => {
  const rides = await rideServices.retrieveHistories(req);
  resHandler(res, {
    message: message("get", "ride history"),
    status: StatusCodes.OK,
    success: true,
    data: rides,
  });
});

const retrieveRides = safeAsync(async (req: Request, res: Response) => {
  const rides = await rideServices.retrieveHistories(req);
  resHandler(res, {
    message: message("get", "rides"),
    status: StatusCodes.OK,
    success: true,
    data: rides,
  });
});

export const rideControllers = {
  updateAccept,
  updateCancel,
  createRide,
  updateStatus,
  retrieveHistories,
  retrieveRides,
};
