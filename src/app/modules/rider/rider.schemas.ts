import z from "zod";

export const paymentMethodEnum = ["CASH", "CARD", "WALLET"] as const;
export const walletTypeEnum = ["APPLE_PAY", "GOOGLE_PAY", "PAYPAL"] as const;
export const cardBrandEnum = [
  "VISA",
  "MASTERCARD",
  "AMEX",
  "DISCOVER",
  "JCB",
  "DINERS",
];

export const paymentMethodSchema = z
  .object({
    type: z.enum(paymentMethodEnum).optional(),
    brand: z.enum(cardBrandEnum).optional(),

    last4: z
      .string({ error: "Last 4 digits must be string." })
      .regex(/^\d{4}$/, "Last 4 must be exactly 4 digits.")
      .optional(),

    expiryMonth: z
      .number({ error: "Expiry month must be an number." })
      .int({ error: "Expiry month must be an number." })
      .min(1, { error: "Expiry month must be between 1-12." })
      .max(12, "Expiry month must be between 1-12.")
      .optional(),

    expiryYear: z
      .number({ error: "Expiry year must be an number." })
      .int({ error: "Expiry year must be an integer." })
      .refine(
        (year) => {
          const current = new Date().getFullYear();
          return year >= current && year <= current + 10;
        },
        { error: "Expiry year must be valid and not expired." }
      )
      .optional(),

    walletType: z.enum(walletTypeEnum).optional(),
    paymentMethodId: z
      .string({ error: "Payment method ID must be string." })
      .optional(),

    isDefault: z
      .boolean({ error: "Payment default flag must be boolean." })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === "CARD") {
      if (!data.brand) {
        ctx.addIssue({
          code: "custom",
          message: "Brand is required for CARD payment method.",
          path: ["brand"],
        });
      }
      if (!data.last4) {
        ctx.addIssue({
          code: "custom",
          message: "Last 4 is required for CARD payment method.",
          path: ["last4"],
        });
      }
      if (!data.expiryMonth) {
        ctx.addIssue({
          code: "custom",
          message: "Expiry month is required for CARD payment method.",
          path: ["expiryMonth"],
        });
      }
      if (!data.expiryYear) {
        ctx.addIssue({
          code: "custom",
          message: "Expiry year is required for CARD payment method.",
          path: ["expiryYear"],
        });
      }
    }

    if (data.type === "WALLET") {
      if (!data.walletType) {
        ctx.addIssue({
          code: "custom",
          message: "Wallet type is required for WALLET payment method.",
          path: ["walletType"],
        });
      }
    }
  });

const favoriteLocationSchema = z.object({
  name: z
    .string({ error: "Location name must be string." })
    .min(1, { error: "Location name is required." }),
  address: z
    .string({ error: "Address must be string." })
    .min(1, { error: "Address is required." }),
  lat: z
    .number({ error: "latitude must be number." })
    .min(1, { error: "Latitude is required." }),
  lng: z
    .number({ error: "Longitude  must be number." })
    .min(1, { error: "Longitude is required." }),
});

const update = z.object({
  favoriteLocations: z.array(favoriteLocationSchema).optional(),
  paymentMethods: z.array(paymentMethodSchema).optional(),
});

export const riderSchemas = {
  update,
};
