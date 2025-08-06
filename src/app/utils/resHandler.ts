import { Response } from "express";
import { StatusCodes } from "http-status-codes";

/**
 * Interface defining the shape of the response payload
 * T = type of 'data', U = type of 'error'
 */
interface ResponsePayloadProps<T, U> {
  success: boolean; // Indicates whether the operation was successful
  status: (typeof StatusCodes)[keyof typeof StatusCodes]; // HTTP status code
  message: string; // A human-readable message for the response
  data?: T; // Optional payload data (e.g., a user, list of items, etc.)
  meta?: {
    total: number; // Optional metadata, useful for pagination
  };
  error?: U; // Optional error object (e.g., validation errors, stack trace)
}

/**
 * A reusable response handler for consistent API responses
 * @param res - Express response object
 * @param payload - Custom payload to send in the response
 */
const resHandler = <T, U>(
  res: Response,
  payload: ResponsePayloadProps<T, U>
) => {
  // Destructure all values from payload
  const { success, status, message, data, meta, error } = payload;

  // Build the response object with only the available (truthy) fields
  const response: Partial<Record<string, unknown>> = {
    success,
    message,
    ...(data && { data }), // Include 'data' only if it exists
    ...(meta && { meta }), // Include 'meta' only if it exists
    ...(error && { error }), // Include 'error' only if it exists
  };

  // Send the response with appropriate HTTP status
  res.status(status).json(response);
};

export default resHandler;
