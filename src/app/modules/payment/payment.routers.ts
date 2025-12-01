import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { paymentSchemas } from "./payment.schemas";
import { paymentControllers } from "./payment.controllers";

const paymentRouter = Router();

// ✅ List payments for (ADMIN, SUPERADMIN)
paymentRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  paymentControllers.listPayments
);

// Payment list for (RIDER, DRIVER)
paymentRouter.get(
  "/history",
  validator.role("RIDER", "DRIVER"),
  paymentControllers.listHistories
);
// Get single payment
paymentRouter.get(
  "/:paymentId",
  validator.role("ADMIN", "SUPERADMIN"),
  paymentControllers.getPayment
);

// Payment single history for (RIDER, DRIVER)
paymentRouter.get(
  "/:paymentId/history",
  validator.role("RIDER", "DRIVER"),
  paymentControllers.getHistory
);

// Update payment (ADMIN, SUPERADMIN)
paymentRouter.patch(
  "/:paymentId",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(paymentSchemas.updatePayment),
  paymentControllers.updatePayment
);

// Delete payment (ADMIN, SUPERADMIN)
paymentRouter.delete(
  "/:paymentId",
  validator.role("ADMIN", "SUPERADMIN"),
  paymentControllers.deletePayment
);

export default paymentRouter;
