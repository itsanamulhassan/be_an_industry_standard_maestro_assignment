import cron from "node-cron";
import { Drivers } from "../driver/driver.models";
import { Users } from "../user/user.models";
import { WalletTransactions } from "../wallet/wallet.models";
import { Payouts } from "./payout.models";
import Stripe from "stripe";

cron.schedule("0 0 * * 1", async () => {
  const drivers = await Drivers.find({ balance: { $gt: 0 } });

  for (const driver of drivers) {
    const user = await Users.findById(driver.user);

    if (!user?.stripeConnectId) continue;

    // Find all unpaid EARNING transactions
    const txs = await WalletTransactions.find({
      driver: driver._id,
      type: "EARNING",
      payout: null,
    });

    if (txs.length === 0) continue;

    const totalAmount = txs.reduce((acc, t) => acc + t.amount, 0);

    // Create payout batch
    const payout = await Payouts.create({
      driver: driver._id,
      amount: totalAmount,
      transactions: txs.map((t) => t._id),
      status: "PENDING",
    });

    try {
      // Stripe Transfer to Connect Account
      const transfer = await Stripe.transfers.create({
        amount: Math.round(totalAmount * 100), // cents
        currency: "eur",
        destination: user.stripeConnectId,
      });

      payout.status = "SUCCESS";
      payout.stripeTransferId = transfer.id;
      await payout.save();

      // Mark tx as paid
      await WalletTransactions.updateMany(
        { _id: { $in: txs.map((t) => t._id) } },
        { $set: { payout: payout._id, type: "PAYOUT" } }
      );

      // Reset wallet balance
      driver.balance = 0;
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
