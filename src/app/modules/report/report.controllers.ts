import { Request, Response } from "express";
import safeAsync from "../../utils/safeAsync";
import { reportServices } from "./report.services";
import resHandler from "../../utils/resHandler";
import { StatusCodes } from "http-status-codes";
import message from "../../utils/message";

const createReport = safeAsync(async (req: Request, res: Response) => {
  const report = await reportServices.createReport(req);
  resHandler(res, {
    status: StatusCodes.CREATED,
    success: true,
    message: message("create", "report"),
    data: report,
  });
});

const listReports = safeAsync(async (req: Request, res: Response) => {
  const reports = await reportServices.listReports(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "reports"),
    data: reports,
  });
});

const getReport = safeAsync(async (req: Request, res: Response) => {
  const report = await reportServices.getReport(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("get", "report"),
    data: report,
  });
});

const updateReport = safeAsync(async (req: Request, res: Response) => {
  const report = await reportServices.updateReport(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("update", "report"),
    data: report,
  });
});

const resolveReport = safeAsync(async (req: Request, res: Response) => {
  const report = await reportServices.resolveReport(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("resolve", "report"),
    data: report,
  });
});

const deleteReport = safeAsync(async (req: Request, res: Response) => {
  await reportServices.deleteReport(req);
  resHandler(res, {
    status: StatusCodes.OK,
    success: true,
    message: message("delete", "report"),
  });
});

export const reportControllers = {
  createReport,
  listReports,
  getReport,
  updateReport,
  resolveReport,
  deleteReport,
};
