import z from "zod";

export const reportReasonEnum = [
  "SAFETY",
  "CONDUCT",
  "VEHICLE",
  "FRAUD",
  "PAYMENT",
  "CANCELLATION_ABUSE",
  "OTHER",
] as const;

export const reportStatusEnum = [
  "PENDING",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
] as const;

// CREATE report body
const create = z.object({
  rideId: z
    .string({
      error: "Ride ID must be a string.",
    })
    .optional(),
  reportedFor: z.string({ error: "Report for must be a string." }).optional(),
  reason: z.enum(reportReasonEnum),
  details: z
    .string({ error: "Report details must be a string." })
    .min(10, { error: "Report details is required." })
    .max(1000, { error: "Report details must be 1000 characters." }),
});

// UPDATE report (admin: change status / add resolution)
const resolve = z.object({
  status: z.enum(reportStatusEnum),
  resolutionNotes: z.string().max(1000).optional().nullable(),
});

const update = z.clone(create);

export const reportSchemas = {
  create,
  update,
  resolve,
};
