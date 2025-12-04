import z from "zod";

export const WalletTransactionTypeEnum = [
  "DEDUCTION",
  "BONUS",
  "ADJUSTMENT",
  "EARNING",
] as const;

const create = z.object({
  driver: z
    .string({ error: "Driver ID must be a string." })
    .min(1, { error: "Driver ID is required." }),
  type: z.enum(["DEDUCTION", "BONUS", "ADJUSTMENT"]),
  status: z.enum(["SUCCESS"]).default("SUCCESS"),
  amount: z
    .number({ error: "Amount must be a number" })
    .min(1, { error: "Amount is required." })
    .negative(),
  description: z.string({ error: "Description must be a string." }).optional(),
});

const update = z
  .clone(create)
  .omit({
    status: true,
  })
  .extend({
    status: z.enum(["SUCCESS", "CANCELED"]),
    ride: z.string({ error: "Ride ID must be a string." }).optional(),
  });

export const walletTransactionSchemas = {
  create,
  update,
};
