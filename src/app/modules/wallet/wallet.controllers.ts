import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import resHandler from "../../utils/resHandler";
import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";
import { walletTransactionServices } from "./wallet.services";

const listWalletTransactions = safeAsync(
  async (req: Request, res: Response) => {
    const walletTransactions =
      await walletTransactionServices.listWalletTransactions(req);
    resHandler(res, {
      status: StatusCodes.OK,
      message: message("get", "wallet transactions"),
      data: walletTransactions,
      success: true,
    });
  }
);
const getWalletTransaction = safeAsync(async (req: Request, res: Response) => {
  const walletTransaction =
    await walletTransactionServices.getWalletTransaction(req);
  resHandler(res, {
    status: StatusCodes.OK,
    message: message("get", "wallet transaction"),
    data: walletTransaction,
    success: true,
  });
});
const listHistories = safeAsync(async (req: Request, res: Response) => {
  const walletTransactions = await walletTransactionServices.listHistories(req);
  resHandler(res, {
    status: StatusCodes.OK,
    message: message("get", "wallet transactions"),
    data: walletTransactions,
    success: true,
  });
});
const getHistory = safeAsync(async (req: Request, res: Response) => {
  const walletTransactions = await walletTransactionServices.getHistory(req);
  resHandler(res, {
    status: StatusCodes.OK,
    message: message("get", "wallet transaction"),
    data: walletTransactions,
    success: true,
  });
});

export const walletTransactionControllers = {
  listWalletTransactions,
  getWalletTransaction,
  listHistories,
  getHistory,
};
