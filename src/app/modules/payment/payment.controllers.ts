/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { paymentServices } from "./payment.services";
import { stripeServices } from "./stripe.services";

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

// Create Stripe Payment Intent
const createStripeIntent = safeAsync(async (req: Request, res: Response) => {
  const dto = req.body;
  const { payment, clientSecret, intentId } =
    await paymentServices.createStripeIntent(dto);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "payment_intent"),
    data: { payment, clientSecret, intentId },
  });
});

// Stripe webhook - raw body required (no JSON parser)
const stripeWebhook = async (req: Request, res: Response) => {
  // Express app should have a route that disables JSON bodyParser for this path, or use raw buffer middleware
  const sig = req.headers["stripe-signature"] as string;
  const raw = (req as any).rawBody as Buffer; // you must capture raw body in middleware
  if (!raw || !sig)
    return res.status(400).send("Missing webhook payload or signature");

  try {
    const event = stripeServices.constructEvent(raw, sig);
    // process event
    await paymentServices.handleStripeWebhookEvent(event);
    return res.status(200).send("ok");
  } catch (err: any) {
    console.error("Stripe webhook error:", err);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
};

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
  createStripeIntent,
  stripeWebhook,
  listPayments,
  getPayment,
  updatePayment,
  deletePayment,
};
