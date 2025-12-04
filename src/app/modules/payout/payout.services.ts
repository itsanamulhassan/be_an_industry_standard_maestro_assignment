import { Request } from "express";

import { Payouts } from "./payout.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";

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
  // const { credentialId } = req.user as JWTCredentialProps;
};

const getHistory = async () => {
  return Payouts.find().populate("driver payment");
};

const updatePayoutStatus = async (req: Request) => {
  const payoutId = req.params.payoutId;
  const payout = await Payouts.findById(payoutId);
  if (!payout) {
    throw new AppError(message("notFound", "payout"), StatusCodes.NOT_FOUND);
  }
  await payout.save();
  return payout;
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
  updatePayoutStatus,
  listHistories,
};
