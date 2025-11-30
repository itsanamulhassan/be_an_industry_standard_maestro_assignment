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
