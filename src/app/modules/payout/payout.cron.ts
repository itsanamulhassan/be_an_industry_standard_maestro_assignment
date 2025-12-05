import cron from "node-cron";
import { Drivers } from "../driver/driver.models";
import { WalletTransactions } from "../wallet/wallet.models";
import { Payouts } from "./payout.models";
import { stripe } from "../payment/stripe.services";

cron.schedule("0 0 * * 1", async () => {
  const drivers = await Drivers.find({ balance: { $gt: 0 } });

  for (const driver of drivers) {
    if (!driver?.stripeConnectId || !driver.isPayoutEnabled) continue;

    // Find all unpaid EARNING transactions
    const transactions = await WalletTransactions.find({
      driver: driver._id,
      type: "EARNING",
      status: "SUCCESS",
      payout: null,
    });

    if (transactions.length === 0) continue;

    const totalAmount = transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    );

    // Create payout batch
    const payout = await Payouts.create({
      driver: driver._id,
      amount: totalAmount,
      transactions: transactions.map((transaction) => transaction._id),
      status: "PENDING",
    });

    try {
      // Stripe Transfer to Connect Account
      const transfer = await stripe.transfers.create({
        amount: Math.round(totalAmount * 100), // cents
        currency: "eur",
        destination: driver.stripeConnectId,
      });

      payout.status = "SUCCESS";
      payout.stripeTransferId = transfer.id;
      await payout.save();

      await WalletTransactions.updateMany(
        { _id: { $in: transactions.map((transaction) => transaction._id) } },
        { $set: { payout: payout._id } }
      );

      await driver.save();
    } catch (error) {
      payout.status = "FAILED";
      if (error instanceof Error) {
        payout.failureReason = error.message;
      }

      await payout.save();
    }
  }
});
