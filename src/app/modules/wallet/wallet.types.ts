import z from "zod";
import { walletTransactionSchemas } from "./wallet.schemas";

export type CreateWalletTransactionDTO = z.infer<
  typeof walletTransactionSchemas.create
>;
export type UpdateWalletTransactionDTO = z.infer<
  typeof walletTransactionSchemas.update
>;
