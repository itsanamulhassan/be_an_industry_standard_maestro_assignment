import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment.services";

const listPayments = safeAsync(async (_req: Request, res: Response) => {
  const payments = await paymentServices.getPayments();
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payments"),
    data: payments,
  });
});

const getPayment = safeAsync(async (req: Request, res: Response) => {
  const payment = await paymentServices.getPayment(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payment"),
    data: payment,
  });
});

const listHistories = safeAsync(async (req: Request, res: Response) => {
  const payments = await paymentServices.listHistories(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payments"),
    data: payments,
  });
});
const getHistory = safeAsync(async (req: Request, res: Response) => {
  const payments = await paymentServices.getHistory(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payment"),
    data: payments,
  });
});

// UPDATE payment
const updatePayment = safeAsync(async (req: Request, res: Response) => {
  const id = req.params.paymentId;
  const payload = req.body;
  const doc = await paymentServices.updatePayment(id, payload);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("update", "payment"),
    data: doc,
  });
});

// DELETE payment
const deletePayment = safeAsync(async (req: Request, res: Response) => {
  await paymentServices.deletePayment(req);

  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("delete", "payment"),
  });
});

export const paymentControllers = {
  listPayments,
  getPayment,
  updatePayment,
  deletePayment,
  listHistories,
  getHistory,
};
