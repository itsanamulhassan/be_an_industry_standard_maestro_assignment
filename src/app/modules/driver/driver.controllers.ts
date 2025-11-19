import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import { driverServices } from "./driver.services";
import resHandler from "../../utils/resHandler";
import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";

const createDriver = safeAsync(async (req: Request, res: Response) => {
  const driver = await driverServices.createDriver(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "driver"),
    data: driver,
  });
});
const updateDriver = safeAsync(async (req: Request, res: Response) => {
  const driver = await driverServices.updateDriver(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("update", "driver"),
    data: driver,
  });
});
const updateOnline = safeAsync(async (req: Request, res: Response) => {
  const driver = await driverServices.updateOnline(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("update", "driver online status"),
    data: driver,
  });
});
const updateActivation = safeAsync(async (req: Request, res: Response) => {
  const driver = await driverServices.updateActivation(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("update", "driver activation status"),
    data: driver,
  });
});
const updateApproval = safeAsync(async (req: Request, res: Response) => {
  const driver = await driverServices.updateApproval(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("update", "driver approval status"),
    data: driver,
  });
});

export const driverControllers = {
  createDriver,
  updateDriver,
  updateOnline,
  updateActivation,
  updateApproval,
};
