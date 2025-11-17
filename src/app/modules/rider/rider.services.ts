import { Request } from "express";
import { Riders } from "./rider.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { UpdateRiderDTO } from "./rider.types";

const updateRider = async (req: Request) => {
  const payload = req.body as UpdateRiderDTO;
  const id = req.params.id;

  const rider = await Riders.findOne({ user: id });
  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }
  return await Riders.findOneAndUpdate(
    { user: id },
    {
      favoriteLocations: payload.favoriteLocation,
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
