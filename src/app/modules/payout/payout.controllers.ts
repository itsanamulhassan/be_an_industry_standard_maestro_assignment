import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import { payoutServices } from "./payout.services";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";

const createPayout = safeAsync(async (req: Request, res: Response) => {
  const payout = await payoutServices.createPayout(req.body);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "payout"),
    data: payout,
  });
});

const getPayout = safeAsync(async (req: Request, res: Response) => {
  const payout = await payoutServices.getPayout(req);
  resHandler(res, {
    status: StatusCodes.OK,
    message: message("get", "payout"),
    success: true,
    data: payout,
  });
});

const listPayouts = safeAsync(async (req: Request, res: Response) => {
  const payouts = await payoutServices.listPayouts(req);
  resHandler(res, {
    success: true,
    message: message("get", "payouts"),
    status: StatusCodes.OK,
    data: payouts,
  });
});

const listHistories = safeAsync(async (req: Request, res: Response) => {
  const payouts = await payoutServices.listHistories(req);
  resHandler(res, {
    success: true,
    message: message("get", "payouts"),
    status: StatusCodes.OK,
    data: payouts,
  });
});
const getHistory = safeAsync(async (req: Request, res: Response) => {
  const payout = await payoutServices.getHistory(req);
  resHandler(res, {
    success: true,
    message: message("get", "payout"),
    status: StatusCodes.OK,
    data: payout,
  });
});

const deletePayout = safeAsync(async (req: Request, res: Response) => {
  await payoutServices.deletePayout(req);
  resHandler(res, {
    success: true,
    status: StatusCodes.OK,
    message: message("delete", "payout"),
  });
});

export const payoutControllers = {
  deletePayout,
  createPayout,
  listPayouts,
  getPayout,
  listHistories,
  getHistory,
};
