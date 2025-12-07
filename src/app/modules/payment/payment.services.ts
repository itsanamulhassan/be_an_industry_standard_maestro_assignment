/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../helpers/error.helper";
import { Payments } from "./payment.models";
import { stripeServices } from "./stripe.services";
import { CreateStripeIntentProps } from "./payment.types";
import { Request } from "express";
import message from "../../utils/message";
import { JWTCredentialProps } from "../../types/utils.types";
import { Types } from "mongoose";
import { withTransaction } from "../../database/transaction";
import { Rides } from "../ride/ride.models";
import { Drivers } from "../driver/driver.models";
import { geo } from "../../utils/geo";
import { WalletTransactions } from "../wallet/wallet.models";

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
  method,
}: CreateStripeIntentProps) => {
  // Create intent
  const intent = await stripeServices.createPaymentIntent({
    amount,
    metadata: { ride, rider, driver },
    email,
  });

  const payment = await Payments.create({
    rider,
    driver,
    ride,
    amount,
    method,
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
  const type = event.type;
  const intent = event.data.object;

  if (!intent?.id) return;

  // HANDLE PAYMENT STATE (transaction safe)

  await withTransaction(async (session) => {
    const payment = await Payments.findOne({
      stripePaymentIntentId: intent.id,
    }).session(session);

    // Idempotency: if already processed, skip safely
    if (payment && payment.status === "SUCCESS") return;

    if (type === "payment_intent.succeeded") {
      await Payments.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        {
          method: (intent.payment_method_types?.[0] || "CARD").toUpperCase(),
          status: "SUCCESS",
          transactionId: intent.id,
          gateway: { name: "stripe", rawResponse: intent },
        },
        { session, runValidators: true }
      );
    }

    if (
      type === "payment_intent.payment_failed" ||
      type === "payment_intent.canceled"
    ) {
      await Payments.findOneAndUpdate(
        { stripePaymentIntentId: intent.id },
        {
          status: "FAILED",
          gateway: { name: "stripe", rawResponse: intent },
        },
        { session, runValidators: true }
      );
    }
  });

  // POST PAYMENT SIDE EFFECTS (NO TRANSACTION — no conflicts)
  // These should NEVER block the payment state update.
  // If they fail, payment still remains correct.

  try {
    const rideId = intent?.metadata?.ride;
    const driverId = intent?.metadata?.driver;

    // If payment succeeded, process earnings
    if (type === "payment_intent.succeeded") {
      const { driverNetEarning } = geo.calculateEarnings({
        riderTotalFare: intent?.amount,
      });

      await WalletTransactions.create({
        amount: driverNetEarning,
        driver: driverId,
        type: "EARNING",
        ride: rideId,
        status: "SUCCESS",
      });
    }

    // Update ride status
    if (rideId) {
      await Rides.findByIdAndUpdate(rideId, {
        status: "COMPLETED",
        completedAt: new Date(),
      });
    }

    // Mark driver available
    if (driverId) {
      await Drivers.findByIdAndUpdate(driverId, {
        isAvailable: true,
      });
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("⚠️ Post-payment side-effect failed:", error); // We DO NOT throw — payment is already committed safely.
  }
};

const getPayments = async () => {
  const payments = await Payments.find();
  return payments;
};

const listHistories = async (req: Request) => {
  const { credentialId: userId, role } = req.user as JWTCredentialProps;
  const lookupCollection = role === "DRIVER" ? "drivers" : "riders";
  const localField = role === "DRIVER" ? "driver" : "rider";
  const payments = await Payments.aggregate([
    // Only include payments that are not deleted
    {
      $match: { isDeleted: false },
    },
    {
      $lookup: {
        from: lookupCollection,
        // Pass the Payment's rider/driver ID into the lookup pipeline
        let: { refId: `$${localField}` },
        pipeline: [
          // First match: join where _id === payment.rider OR payment.driver
          {
            $match: {
              $expr: { $eq: ["$_id", "$$refId"] },
            },
          },
          // Second match: ensure the joined user is the logged-in user
          {
            $match: {
              user: new Types.ObjectId(userId),
            },
          },
        ],
        as: "userInfo",
      },
    },
    // Filter out payments where user doesn't belong to this rider/driver
    {
      $match: { userInfo: { $ne: [] } },
    },
    {
      $project: { userInfo: 0 },
    },
  ]);
  return payments;
};
const getHistory = async (req: Request) => {
  const { credentialId: userId, role } = req.user as JWTCredentialProps;
  const lookupCollection = role === "DRIVER" ? "drivers" : "riders";
  const localField = role === "DRIVER" ? "driver" : "rider";
  const paymentId = req.params.paymentId;
  const payment = await Payments.aggregate([
    {
      $match: {
        isDeleted: false,
        _id: new Types.ObjectId(paymentId),
      },
    },
    {
      $lookup: {
        from: lookupCollection,
        let: { refId: `$${localField}` },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$_id", "$$refId"] },
            },
          },
          {
            $match: {
              user: new Types.ObjectId(userId),
            },
          },
        ],
        as: "userInfo",
      },
    },
    {
      $match: {
        userInfo: { $ne: [] },
      },
    },
    {
      $project: { userInfo: 0 },
    },
  ]);
  if (!payment[0]) {
    throw new AppError(message("notFound", "payment"), StatusCodes.NOT_FOUND);
  }
  return payment[0];
};

const getPayment = async (req: Request) => {
  const paymentId = req.params.paymentId;
  const payment = await Payments.findById(paymentId);
  if (!payment) {
    throw new AppError(message("notFound", "payment"), StatusCodes.NOT_FOUND);
  }
  return payment;
};

const updatePayment = async (id: string, payload: any) => {
  const updated = await Payments.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!updated)
    throw new AppError(message("notFound", "payment"), StatusCodes.NOT_FOUND);
  return updated;
};

const deletePayment = async (req: Request) => {
  const paymentId = req.params.paymentId;
  const deleted = await Payments.findByIdAndUpdate(paymentId, {
    isDeleted: true,
  });
  if (!deleted) {
    throw new AppError(message("notFound", "payment"), StatusCodes.NOT_FOUND);
  }
  return true;
};

export const paymentServices = {
  createPaymentRecord,
  createStripeIntent,
  handleStripeWebhookEvent,
  getPayments,
  getPayment,
  updatePayment,
  deletePayment,
  listHistories,
  getHistory,
};
