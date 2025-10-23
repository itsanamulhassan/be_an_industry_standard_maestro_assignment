import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import resHandler from "../utils/resHandler";
import message from "../utils/message";

const invalidRoute = (req: Request, res: Response) => {
  resHandler(res, {
    success: false,
    status: StatusCodes.NOT_FOUND,
    message: message("notFound", "route", "--> " + req.path + " <--"),
  });
};

export default invalidRoute;
