import { Request } from "express";
import { WalletTransactions } from "./wallet.models";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { JWTCredentialProps } from "../../types/utils.types";
import { Types } from "mongoose";
import {
  CreateWalletTransactionDTO,
  UpdateWalletTransactionDTO,
} from "./wallet.types";

const getDriverBalance = async (
  driverId: string,
  type: "PAID" | "UNPAID" = "UNPAID"
) => {
  const result = await WalletTransactions.aggregate([
    {
      $match: {
        driver: new Types.ObjectId(driverId),
        ...(type === "UNPAID" && { payout: null }),
        status: "SUCCESS",
      },
    },
    {
      $group: {
        _id: null,
        totalBalance: { $sum: "$amount" },
      },
    },
  ]);

  return result.length ? result[0].totalBalance : 0;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listWalletTransactions = async (_req: Request) => {
  const walletTransactions = await WalletTransactions.find();
  return walletTransactions;
};
const getWalletTransaction = async (req: Request) => {
  const walletTransactionId = req.params.walletTransactionId;
  const walletTransaction = await WalletTransactions.findById(
    walletTransactionId
  );
  if (!walletTransaction) {
    throw new AppError(
      message("notFound", "wallet transaction"),
      StatusCodes.NOT_FOUND
    );
  }
  return walletTransaction;
};
const listHistories = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;
  const walletTransactions = await WalletTransactions.aggregate([
    {
      $lookup: {
        from: "drivers",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $unwind: "$driverInfo",
    },
    {
      $match: {
        "driverInfo.user": new Types.ObjectId(userId),
      },
    },
    {
      $project: { driverInfo: 0 },
    },
  ]);

  return walletTransactions;
};
const getHistory = async (req: Request) => {
  const walletTransactionId = req.params.walletTransactionId;
  const { credentialId: userId } = req.user as JWTCredentialProps;
  const walletTransaction = await WalletTransactions.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(walletTransactionId),
      },
    },
    {
      $lookup: {
        from: "drivers",
        localField: "driver",
        foreignField: "_id",
        as: "driverInfo",
      },
    },
    {
      $unwind: "$driverInfo",
    },
    {
      $match: {
        "driverInfo.user": new Types.ObjectId(userId),
      },
    },
    {
      $project: { driverInfo: 0 },
    },
  ]);
  return walletTransaction[0];
};
const createWalletTransaction = async (req: Request) => {
  const payload = req.body as CreateWalletTransactionDTO;
  const walletTransaction = await WalletTransactions.create(payload);
  return walletTransaction;
};

const updateWalletTransaction = async (req: Request) => {
  const walletTransactionId = req.params.walletTransactionId;
  const payload = req.body as UpdateWalletTransactionDTO;
  const walletTransaction = await WalletTransactions.findById(
    walletTransactionId
  );

  if (!walletTransaction) {
    throw new AppError(
      message("notFound", "wallet transaction"),
      StatusCodes.NOT_FOUND
    );
  }

  if (walletTransaction.type === "EARNING") {
    throw new AppError(
      message(
        "badRequest",
        "wallet transaction",
        "You cannot update this transaction."
      ),
      StatusCodes.BAD_REQUEST
    );
  }

  const latestWalletTransaction = await WalletTransactions.findByIdAndUpdate(
    walletTransactionId,
    payload,
    {
      new: true,
      runValidators: true,
    }
  );

  return latestWalletTransaction;
};

export const walletTransactionServices = {
  listWalletTransactions,
  getWalletTransaction,
  listHistories,
  getHistory,
  getDriverBalance,
  createWalletTransaction,
  updateWalletTransaction,
};
