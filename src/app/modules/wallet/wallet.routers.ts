import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { walletTransactionControllers } from "./wallet.controllers";
import { walletTransactionSchemas } from "./wallet.schemas";

const walletTransactionRouter = Router();
walletTransactionRouter.post(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(walletTransactionSchemas.create),
  walletTransactionControllers.createWalletTransaction
);
walletTransactionRouter.post(
  ":/walletTransactionId",
  validator.role("ADMIN", "SUPERADMIN"),
  validator.schema(walletTransactionSchemas.update),
  walletTransactionControllers.updateWalletTransaction
);

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
