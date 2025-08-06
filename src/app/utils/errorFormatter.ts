import generateMessage from "../utils/message";
import { ZodError } from "zod";
import mongoose from "mongoose";

// ✅ Handles MongoDB duplicate key errors (code 11000)
export const mongooseDuplicate = (error: {
  cause: { keyValue: Record<string, string> };
}) => {
  const duplicateValue = Object.values(error?.cause?.keyValue || {})[0];

  return {
    statusCode: 400,
    message: generateMessage("alreadyExists", duplicateValue).toLowerCase(),
    errorSource: [{ path: duplicateValue, message: "Duplicate key error" }],
  };
};

// ✅ Handles invalid MongoDB ObjectId errors (CastError)
export const mongooseCast = () => ({
  statusCode: 400,
  message: generateMessage("notFound", "Object ID"),
  errorSource: [{ path: "_id", message: "Invalid ObjectId" }],
});

// ✅ Handles Mongoose schema validation errors (ValidationError)
export const mongooseValidation = (error: mongoose.Error.ValidationError) => ({
  statusCode: 400,
  message: "Validation error",
  errorSource: Object.values(error.errors).map((issue) => ({
    path: issue.path,
    message: issue.message,
  })),
});

// ✅  Handles Zod schema validation errors (ZodError)
export const zodValidation = (error: ZodError) => ({
  statusCode: 400,
  message: "Zod validation error!",
  errorSource: error.issues.map((issue) => ({
    path: (issue.path?.length > 1
      ? issue.path?.reverse().join(" inside ")
      : issue.path.slice(-1)[0]) as string,
    message: issue.message,
  })),
});

// ✅ Main error formatter object
export const errorFormatter = {
  mongooseDuplicate,
  mongooseCast,
  mongooseValidation,
  zodValidation,
};
