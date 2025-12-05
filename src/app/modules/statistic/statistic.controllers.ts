import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import { statisticServices } from "./statistic.services";
import resHandler from "../../utils/resHandler";
import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";

const getDriverStatistic = safeAsync(async (req: Request, res: Response) => {
  const statistic = await statisticServices.getDriverStatistic(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "driver statistic"),
    data: statistic,
  });
});

const getRiderStatistic = safeAsync(async (req: Request, res: Response) => {
  const statistic = await statisticServices.getRiderStatistic(req);
  resHandler(res, {
    success: true,
    status: StatusCodes.OK,
    message: message("get", "rider statistic"),
    data: statistic,
  });
});

const getAdminStatistic = safeAsync(async (_req: Request, res: Response) => {
  const statistic = await statisticServices.getAdminStatistic();
  resHandler(res, {
    success: true,
    status: StatusCodes.OK,
    message: message("get", "all statistic"),
    data: statistic,
  });
});

export const statisticControllers = {
  getDriverStatistic,
  getRiderStatistic,
  getAdminStatistic,
};
