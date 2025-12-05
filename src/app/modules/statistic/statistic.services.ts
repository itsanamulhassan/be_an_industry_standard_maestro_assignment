import { WalletTransactions } from "../wallet/wallet.models";
import { Rides } from "../ride/ride.models";
import { Payouts } from "../payout/payout.models";
import { Payments } from "../payment/payment.models";
import { Drivers } from "../driver/driver.models";
import { Request } from "express";
import { JWTCredentialProps } from "../../types/utils.types";
import AppError from "../../helpers/error.helper";
import message from "../../utils/message";
import { StatusCodes } from "http-status-codes";
import { Riders } from "../rider/rider.models";

const getDriverStatistic = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;

  const driver = await Drivers.findOne({ user: userId }).select("_id");

  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }

  // 1) Pending balance = SUM of successful transactions with payoutBatchId null
  const pendingAgg = await WalletTransactions.aggregate([
    {
      $match: {
        driver: driver._id,
        status: "SUCCESS",
        payout: null,
      },
    },
    { $group: { _id: null, pending: { $sum: "$amount" } } },
  ]);
  const pendingBalance = pendingAgg;

  // 2) Total lifetime earnings (sum of all credits minus deductions)
  const lifetimeAgg = await WalletTransactions.aggregate([
    {
      $match: {
        driver: driver._id,
        status: "SUCCESS",
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const lifetimeTotal = lifetimeAgg;

  // 3) Completed rides count
  const completedRides = await Rides.countDocuments({
    driver: driver._id,
    status: "COMPLETED",
  });

  // 4) Payout history (last 10)
  const payouts = await Payouts.find({ driver: driver._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  return {
    pendingBalance,
    lifetimeTotal,
    completedRides,
    payouts,
  };
};

const getRiderStatistic = async (req: Request) => {
  const { credentialId: userId } = req.user as JWTCredentialProps;
  const rider = await Riders.findOne({ user: userId }).select("_id");

  if (!rider) {
    throw new AppError(message("notFound", "rider"), StatusCodes.NOT_FOUND);
  }

  const totalSpentAgg = await Payments.aggregate([
    { $match: { rider: rider._id, status: "SUCCESS" } },
    { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
  ]);

  const totalSpent = totalSpentAgg;

  const ridesCount = await Rides.countDocuments({ rider: rider._id });

  return { totalSpent, ridesCount };
};

const getAdminStatistic = async () => {
  const totalRevenueAgg = await Payments.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, revenue: { $sum: "$amount" } } },
  ]);
  const revenue = totalRevenueAgg[0]?.revenue ?? 0;

  const activeDrivers = await Drivers.countDocuments({ isAvailable: true });
  const totalRides = await Rides.countDocuments();

  return { revenue, activeDrivers, totalRides };
};
export const statisticServices = {
  getDriverStatistic,
  getRiderStatistic,
  getAdminStatistic,
};
