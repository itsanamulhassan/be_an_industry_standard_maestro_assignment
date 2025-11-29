/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../helpers/error.helper";
import { Payments } from "./payment.models";
import { stripeServices } from "./stripe.services";
import { CreateStripeIntentProps } from "./payment.types";

const createPaymentRecord = async (payload: any) => {
  // payload validated by zod upstream
  const exists = await Payments.findOne({ ride: payload.ride });
  if (exists) {
    throw new AppError(
      "Payment already exists for this ride",
      StatusCodes.BAD_REQUEST
    );
  }
  const doc = await Payments.create(payload);
  return doc;
};

// Create stripe payment intent and DB record
const createStripeIntent = async ({
  amount,
  driver,
  ride,
  rider,
  email,
  savePaymentMethod,
}: CreateStripeIntentProps) => {
  // Create intent
  const intent = await stripeServices.createPaymentIntent({
    amount,
    metadata: { ride, rider },
    email,
  });

  const payment = await Payments.create({
    rider,
    driver,
    ride,
    amount,
    method: "STRIPE",
    stripePaymentIntentId: intent.id,
    stripeClientSecret: intent.client_secret ?? null,
    gateway: { name: "stripe", rawResponse: intent },
  });

  return {
    payment: payment,
    clientSecret: intent.client_secret ?? null,
    intentId: intent.id,
  };
};

const handleStripeWebhookEvent = async (event: any) => {
  // event is Stripe event object
  const type = event.type;
  const intent = event.data.object;

  if (!intent || !intent.id) return;

  if (type === "payment_intent.succeeded") {
    await Payments.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      {
        status: "SUCCESS",
        transactionId: intent.id,
        gateway: { name: "stripe", rawResponse: intent },
      }
    );
  } else if (type === "payment_intent.payment_failed") {
    await Payments.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      {
        status: "FAILED",
        gateway: { name: "stripe", rawResponse: intent },
      }
    );
  } else if (type === "payment_intent.canceled") {
    await Payments.findOneAndUpdate(
      { stripePaymentIntentId: intent.id },
      {
        status: "FAILED",
        gateway: { name: "stripe", rawResponse: intent },
      }
    );
  }
  // add more event types as needed
};

const getPayments = async (filter: any = {}) => {
  const q: any = { ...filter };
  const items = await Payments.find(q).sort({ createdAt: -1 }).lean();
  return items;
};

const getPaymentById = async (id: string) => {
  const doc = await Payments.findById(id);
  if (!doc) throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
  return doc;
};

const updatePayment = async (id: string, payload: any) => {
  const updated = await Payments.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated) throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
  return updated;
};

const deletePayment = async (id: string) => {
  const deleted = await Payments.findByIdAndDelete(id);
  if (!deleted) throw new AppError("Payment not found", StatusCodes.NOT_FOUND);
  return true;
};

export const paymentServices = {
  createPaymentRecord,
  createStripeIntent,
  handleStripeWebhookEvent,
  getPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
