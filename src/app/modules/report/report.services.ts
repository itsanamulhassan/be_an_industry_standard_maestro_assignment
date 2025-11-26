import { StatusCodes } from "http-status-codes";
import AppError from "../../helpers/error.helper";
import { Reports } from "./report.models";
import message from "../../utils/message";
import { Request } from "express";
import {
  CreateReportDTO,
  ResolveReportDTO,
  UpdateReportDTO,
} from "./report.types";
import { JWTCredentialProps } from "../../types/utils.types";

//✅ Create report
const createReport = async (req: Request) => {
  const payload = req.body as CreateReportDTO;
  const { credentialId } = req.user as JWTCredentialProps;

  if (!payload.reportedFor && !payload.rideId) {
    throw new AppError(
      message("notFound", "ride or reported for id"),
      StatusCodes.NOT_FOUND
    );
  }

  const report = await Reports.create({
    ride: payload.rideId ? payload.rideId : null,
    reporter: credentialId,
    reportedFor: payload.reportedFor ? payload.reportedFor : null,
    reason: payload.reason,
    details: payload.details,
    // screenshots: payload.screenshots || [],
  });

  return report;
};

// ✅ List reports for ADMIN, SUPERADMIN
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listReports = async (_req: Request) => {
  const reports = await Reports.find();

  return reports;
};

// ✅ Report by ID for ADMIN, SUPERADMIN
const getReport = async (req: Request) => {
  const reportId = req.params.reportId;
  const report = await Reports.findById(reportId);
  return report;
};

// ✅ Update report by ID
const updateReport = async (req: Request) => {
  const reportId = req.params.reportId;
  const payload = req.body as UpdateReportDTO;

  const report = await Reports.findById(reportId);
  if (!report) {
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
  }

  const updatedReport = await Reports.findByIdAndUpdate(reportId, payload);

  return updatedReport;
};

// ✅ Update resolve the report for ADMIN, SUPERADMIN
const resolveReport = async (req: Request) => {
  const reportId = req.params.reportId;
  const payload = req.body as ResolveReportDTO;
  const report = await Reports.findById(reportId);
  if (!report)
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);

  const updatedReport = await Reports.findByIdAndUpdate(reportId, payload);
  return updatedReport;
};

// ✅ Delete report by ADMIN, SUPERADMIN
const deleteReport = async (req: Request) => {
  const reportId = req.params.reportId;
  const report = await Reports.findById(reportId);
  if (!report) {
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
  }

  report.isDeleted = true;
  await report.save();
};

export const reportServices = {
  createReport,
  listReports,
  getReport,
  updateReport,
  resolveReport,
  deleteReport,
};
