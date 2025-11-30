/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment.services";
import { stripeServices } from "./stripe.services";
import AppError from "../../helpers/error.helper";

// Create generic payment record (usually for cash/wallet)
const createPayment = safeAsync(async (req: Request, res: Response) => {
  const dto = req.body;
  const doc = await paymentServices.createPaymentRecord(dto);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "payment"),
    data: doc,
  });
});

// Stripe webhook
const stripeWebhook = safeAsync(async (req: Request, res: Response) => {
  // Express app should have a route that disables JSON bodyParser for this path, or use raw buffer middleware
  const signature = req.headers["stripe-signature"] as string;
  const payload = (req as any).rawBody as Buffer;
  console.log({ signature, payload });
  if (!payload) {
    throw new AppError(
      message("notFound", "webhook payload"),
      StatusCodes.NOT_FOUND
    );
  }
  if (!signature) {
    throw new AppError(
      message("notFound", "webhook signature"),
      StatusCodes.NOT_FOUND
    );
  }
  const event = stripeServices.constructEvent(payload, signature);
  if (!event) {
    throw new AppError(
      message("notFound", "webhook event"),
      StatusCodes.NOT_FOUND
    );
  }
  await paymentServices.handleStripeWebhookEvent(event);
});

// GET payments
const listPayments = safeAsync(async (req: Request, res: Response) => {
  const q = req.query;
  const items = await paymentServices.getPayments(q);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payments"),
    data: items,
  });
});

// GET payment by ID
const getPayment = safeAsync(async (req: Request, res: Response) => {
  const id = req.params.paymentId;
  const doc = await paymentServices.getPaymentById(id);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "payment"),
    data: doc,
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
  await paymentServices.deletePayment(req.params.paymentId);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("delete", "payment"),
  });
});

export const paymentControllers = {
  createPayment,
  stripeWebhook,
  listPayments,
  getPayment,
  updatePayment,
  deletePayment,
};
