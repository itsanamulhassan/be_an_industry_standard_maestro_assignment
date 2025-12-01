import z from "zod";
import { paymentStatusEnum } from "../payment/payment.schemas";

const create = z.object({
  totalAmount: z
    .number({ error: "Total amount must be a number" })
    .min(1, { error: "Total amount is required." }),
});
const updateStatus = z.object({
  status: z.enum(paymentStatusEnum),
});

export const payoutSchemas = {
  create,
  updateStatus,
};
