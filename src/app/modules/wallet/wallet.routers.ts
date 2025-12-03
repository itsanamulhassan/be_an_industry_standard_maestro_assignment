import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { walletTransactionControllers } from "./wallet.controllers";

const walletTransactionRouter = Router();

walletTransactionRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  walletTransactionControllers.listWalletTransactions
);
walletTransactionRouter.get(
  "/:walletTransactionId",
  validator.role("ADMIN", "SUPERADMIN"),
  walletTransactionControllers.getWalletTransaction
);
walletTransactionRouter.get(
  "/history",
  validator.role("DRIVER"),
  walletTransactionControllers.listHistories
);
walletTransactionRouter.get(
  "/:walletTransactionId/history",
  validator.role("DRIVER"),
  walletTransactionControllers.getHistory
);

export default walletTransactionRouter;
