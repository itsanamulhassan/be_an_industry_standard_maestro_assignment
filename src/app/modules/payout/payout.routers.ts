import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { payoutControllers } from "./payout.controllers";
import { payoutSchemas } from "./payout.schemas";

const payoutRouter = Router();

payoutRouter.post(
  "/",
  validator.schema(payoutSchemas.create),
  validator.role("DRIVER"),
  payoutControllers.createPayout
);

payoutRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.listPayouts
);

payoutRouter.get(
  "/:payoutId",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.getPayout
);

payoutRouter.patch(
  "/:payoutId/status",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(payoutSchemas.updateStatus),
  payoutControllers.updatePayoutStatus
);
payoutRouter.delete("/:id", payoutControllers.deletePayout);

export default payoutRouter;
