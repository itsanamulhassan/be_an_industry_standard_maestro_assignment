import z from "zod";

const vehicleInfoSchema = z.object({
  model: z
    .string({ error: "Model must be a string." })
    .min(1, { error: "Model is required." }),
  color: z
    .string({ error: "Color must be a string." })
    .min(1, { error: "Color is required." }),
  capacity: z
    .number({ error: "Capacity must be a number." })
    .min(1, { error: "Capacity is required." }),
  plateNumber: z
    .string({ error: "Plate number must be a string." })
    .min(1, { error: "Plate number is required." }),
});

const create = z.object({
  vehicleInfo: z.array(vehicleInfoSchema),
  licenseNumber: z
    .string({ error: "License number must be a string" })
    .min(1, { error: "License number is required." }),
});

const updateOnline = z.object({
  isOnline: z
    .boolean({ error: "Online status must be a boolean." })
    .default(false),
});
const updateApproval = z.object({
  isApproved: z
    .boolean({ error: "Approval status must be a boolean." })
    .default(false),
});
const updateActivation = z.object({
  isActivated: z
    .boolean({ error: "Activation status must be a boolean." })
    .default(false),
});
const update = z.clone(create);

export const driverSchemas = {
  create,
  update,
  updateOnline,
  updateApproval,
  updateActivation,
};
