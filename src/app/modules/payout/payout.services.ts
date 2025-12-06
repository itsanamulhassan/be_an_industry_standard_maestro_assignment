import { Request } from "express";
import { Payouts } from "./payout.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { JWTCredentialProps } from "../../types/utils.types";
import { Types } from "mongoose";

const createPayout = async (req: Request) => {
  const payload = req.body;
  const payout = await Payouts.create(payload);
  return payout;
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listPayouts = async (_req: Request) => {
  const payouts = await Payouts.find();
  return payouts;
};

const getPayout = async (req: Request) => {
  const payoutId = req.params.payoutId;

  const payout = await Payouts.findById(payoutId);
  return payout;
};

const listHistories = async (req: Request) => {
  const { credentialId, role } = req.user as JWTCredentialProps;

  const localField = role === "RIDER" ? "rider" : "driver";
  const lookupCollection = role === "RIDER" ? "riders" : "drivers";

  const payouts = Payouts.aggregate([
    {
      $lookup: {
        from: lookupCollection,
        localField: localField,
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $match: { "userInfo.user": new Types.ObjectId(credentialId) },
    },
    {
      $project: {
        userInfo: 0,
      },
    },
  ]);
  return payouts;
};

const getHistory = async (req: Request) => {
  const { credentialId, role } = req.user as JWTCredentialProps;
  const payoutId = req.params.payoutId;

  const localField = role === "RIDER" ? "rider" : "driver";
  const lookupCollection = role === "RIDER" ? "riders" : "drivers";

  const payouts = Payouts.aggregate([
    {
      $match: { _id: new Types.ObjectId(payoutId) },
    },
    {
      $lookup: {
        from: lookupCollection,
        localField: localField,
        foreignField: "_id",
        as: "userInfo",
      },
    },
    {
      $unwind: "$userInfo",
    },
    {
      $match: { "userInfo.user": new Types.ObjectId(credentialId) },
    },
    {
      $project: {
        userInfo: 0,
      },
    },
  ]);
  return payouts;
};

const deletePayout = async (req: Request) => {
  const payoutId = req.params.payoutId;
  const payout = await Payouts.findById(payoutId);
  if (!payout) {
    throw new AppError(message("notFound", "payout"), StatusCodes.NOT_FOUND);
  }
  payout.isDeleted = true;
  await payout.save();
  return payout;
};

export const payoutServices = {
  createPayout,
  getPayout,
  deletePayout,
  getHistory,
  listPayouts,
  listHistories,
};
