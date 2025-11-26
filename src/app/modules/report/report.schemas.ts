import z from "zod";

export const reportReasonEnum = z.enum([
  "SAFETY",
  "CONDUCT",
  "VEHICLE",
  "FRAUD",
  "PAYMENT",
  "CANCELLATION_ABUSE",
  "OTHER",
]);

export const reportStatusEnum = z.enum([
  "PENDING",
  "IN_REVIEW",
  "RESOLVED",
  "REJECTED",
]);

// CREATE report body
const create = z.object({
  rideId: z
    .string({
      error: "Ride ID must be a string.",
    })
    .optional(),
  reportedFor: z.string({ error: "Report for must be a string." }).optional(),
  reason: reportReasonEnum,
  details: z
    .string({ error: "Report details must be a string." })
    .min(10, { error: "Report details is required." })
    .max(1000, { error: "Report details must be 1000 characters." }),
});
// LIST / QUERY reports - supports filtering & pagination
const listReportsSchema = z.object({
  query: z.object({
    rideId: z.string().optional(),
    reportedUserId: z.string().optional(),
    reporterId: z.string().optional(),
    reason: reportReasonEnum.optional(),
    status: reportStatusEnum.optional(),
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().optional().default(20),
    sortBy: z.string().optional().default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  }),
});

// UPDATE report (admin: change status / add resolution)
const resolve = z.object({
  status: reportStatusEnum,
  resolutionNotes: z.string().max(1000).optional().nullable(),
});

const update = z.clone(create);

export const reportSchemas = {
  create,
  listReportsSchema,
  update,
  resolve,
};
