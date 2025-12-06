import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { payoutControllers } from "./payout.controllers";

const payoutRouter = Router();

payoutRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.listPayouts
);
payoutRouter.get(
  "/history",
  validator.role("DRIVER", "RIDER"),
  payoutControllers.listHistories
);

payoutRouter.get(
  "/:payoutId/history",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.getHistory
);

payoutRouter.get(
  "/:payoutId",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.getPayout
);

payoutRouter.delete(
  "/:payoutId",
  validator.role("ADMIN", "SUPERADMIN"),
  payoutControllers.deletePayout
);

export default payoutRouter;
