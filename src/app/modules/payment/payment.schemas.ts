import z from "zod";

export const paymentMethodEnum = ["CASH", "STRIPE", "CARD", "WALLET"] as const;
export const paymentStatusEnum = [
  "PENDING",
  "PROCESSING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
] as const;

// Create generic payment (for non-Stripe / internal records)
export const createPaymentSchema = z.object({
  rider: z.string().min(1),
  driver: z.string().optional().nullable(),
  ride: z.string().min(1),
  amount: z.number().positive(),
  method: paymentMethodEnum,
  metadata: z.record(z.string(), z.any()).optional(),
});

// Create Stripe Payment Intent (rider initiates)
export const createStripeIntentSchema = z.object({
  rider: z.string().min(1),
  driver: z.string().optional().nullable(),
  ride: z.string().min(1),
  amount: z.number().positive(),
  currency: z.string().default("usd"),
  // optional: save payment method on customer
  savePaymentMethod: z.boolean().optional().default(false),
  receiptEmail: z.email().optional(),
});

// Update payment (admin)
export const updatePaymentSchema = z.object({
  status: z.enum(paymentStatusEnum).optional(),
  transactionId: z.string().optional(),
  gateway: z.record(z.string(), z.any()).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Webhook endpoint doesn't use JSON schema validation here (Stripe signs raw body)
export const paymentSchemas = {
  createPayment: createPaymentSchema,
  createStripeIntent: createStripeIntentSchema,
  updatePayment: updatePaymentSchema,
};
