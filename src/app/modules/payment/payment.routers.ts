import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { userRoleEnum } from "../user/user.schemas";
import { paymentSchemas } from "./payment.schemas";
import { paymentControllers } from "./payment.controllers";

const paymentRouter = Router();

// ✅ Create a generic payment record (cash/wallet) (RIDER)
paymentRouter.post(
  "/",
  validator.role("RIDER"),
  validator.schema(paymentSchemas.createPayment),
  paymentControllers.createPayment
);

// ✅ Create Stripe payment intent (RIDER)
paymentRouter.post(
  "/intent",
  validator.role("RIDER"),
  validator.schema(paymentSchemas.createStripeIntent),
  paymentControllers.createStripeIntent
);

// Stripe webhook - raw body (no auth)
paymentRouter.post(
  "/webhook",
  // raw body handling should be configured in app; do not use JSON body parser for this route
  paymentControllers.stripeWebhook
);

// Admin list
paymentRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  paymentControllers.listPayments
);

// Rider/Driver see their payments (you can implement query filter in controller or service)
// Get single payment
paymentRouter.get(
  "/:paymentId",
  validator.role(...userRoleEnum),
  paymentControllers.getPayment
);

// Update payment (ADMIN)
paymentRouter.patch(
  "/:paymentId",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(paymentSchemas.updatePayment),
  paymentControllers.updatePayment
);

// Delete payment (SUPERADMIN)
paymentRouter.delete(
  "/:paymentId",
  validator.role("SUPERADMIN"),
  paymentControllers.deletePayment
);

export default paymentRouter;
