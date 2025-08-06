import message from "app/utils/message";
import resHandler from "app/utils/resHandler";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

const invalidRoute = (req: Request, res: Response) => {
  resHandler(res, {
    success: false,
    status: StatusCodes.NOT_FOUND,
    message: message("notFound", "route", "--> " + req.path + " <--"),
  });
};

export default invalidRoute;
