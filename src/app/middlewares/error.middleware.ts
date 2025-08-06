import { ErrorRequestHandler } from "express";
import { errorFormatter } from "../utils/errorFormatter";
import environments from "app/configurations/environments";
import { ErrorSourceProps } from "app/types/middleware.types";
import AppError from "app/helpers/error.helper";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const isDev = environments.node_env === "development";

  let statusCode = 500;
  let message = "Something went wrong! 🐞";
  let errorSource: ErrorSourceProps[] = [];

  if (error?.name === "ZodError") {
    ({ statusCode, message, errorSource } =
      errorFormatter.zodValidation(error));
  } else if (error?.cause?.code === 11000) {
    ({ statusCode, message } = errorFormatter.mongooseDuplicate(error));
  } else if (error?.name === "CastError") {
    ({ statusCode, message } = errorFormatter.mongooseCast());
  } else if (error?.name === "ValidationError") {
    ({ statusCode, message, errorSource } =
      errorFormatter.mongooseValidation(error));
  } else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const errorResponse = {
    success: false,
    message,
    ...(isDev && { error }),
    ...(errorSource.length && { errorSource }),
    ...(isDev && { stack: error.stack }),
  };

  res.status(statusCode).json(errorResponse);
};

export default globalErrorHandler;
