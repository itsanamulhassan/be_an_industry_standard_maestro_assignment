import { StatusCodes } from "http-status-codes";
import resHandler from "../../utils/resHandler";
import safeAsync from "../../utils/safeAsync";
import { riderServices } from "./rider.services";
import message from "../../utils/message";
import { Request, Response } from "express";

const updateRider = safeAsync(async (req: Request, res: Response) => {
  const rider = await riderServices.updateRider(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("update", "rider"),
    data: rider,
  });
});

export const riderControllers = {
  updateRider,
};
