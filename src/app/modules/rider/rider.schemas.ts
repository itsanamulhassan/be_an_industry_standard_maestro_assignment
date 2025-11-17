import z from "zod";

export const paymentEnum = ["CASH", "CARD", "WALLET"] as const;

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
  favoriteLocation: z.array(favoriteLocationSchema),
});

export const riderSchemas = {
  update,
};
