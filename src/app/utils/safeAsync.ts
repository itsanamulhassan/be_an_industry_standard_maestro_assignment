import { NextFunction, Request, Response } from "express";

/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware.
 *
 * @param asyncFunc - Async route handler function returning a Promise.
 * @returns Wrapped function with proper types that catches rejected promises.
 */
const safeAsync =
  (
    asyncFunc: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(asyncFunc(req, res, next)).catch((error) => next(error));
  };

export default safeAsync;
