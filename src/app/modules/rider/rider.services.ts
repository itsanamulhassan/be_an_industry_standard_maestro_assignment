import { Request } from "express";
import { Riders } from "./rider.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { UpdateRiderDTO } from "./rider.types";

const updateRider = async (req: Request) => {
  const payload = req.body as UpdateRiderDTO;
  const userId = req.params.userId;

  const rider = await Riders.findOne({ user: userId });
  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }
  return await Riders.findOneAndUpdate(
    { user: userId },
    {
      favoriteLocations: payload.favoriteLocations,
      paymentMethods: payload.paymentMethods,
    },
    {
      runValidators: true,
      new: true,
    }
  );
};

export const riderServices = {
  updateRider,
};
