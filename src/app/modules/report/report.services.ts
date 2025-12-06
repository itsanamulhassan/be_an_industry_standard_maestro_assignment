import { StatusCodes } from "http-status-codes";
import AppError from "../../helpers/error.helper";
import { Report, Reports } from "./report.models";
import message from "../../utils/message";
import { Request } from "express";
import {
  CreateReportDTO,
  ResolveReportDTO,
  UpdateReportDTO,
} from "./report.types";
import { JWTCredentialProps } from "../../types/utils.types";
import { Users } from "../user/user.models";
import { Rides } from "../ride/ride.models";
import { FileProps } from "../../types/global.types";
import { deleteCloudinaryFile } from "../../configurations/cloudinary";

//✅ Create report
const createReport = async (req: Request) => {
  const payload = req.body as CreateReportDTO;
  const screenshots = (
    Array.isArray(req.files)
      ? req.files.map((file: Express.Multer.File) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : []
  ) as FileProps[];
  const { credentialId } = req.user as JWTCredentialProps;

  if (!payload.reportedFor && !payload.rideId) {
    throw new AppError(
      message("notFound", "ride or reported for id"),
      StatusCodes.NOT_FOUND
    );
  }

  if (payload.reportedFor) {
    const user = await Users.findById(payload.reportedFor);
    if (!user) {
      throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
    }
  }
  if (payload.rideId) {
    const ride = await Rides.findById(payload.rideId);
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }
  }

  const report = await Reports.create({
    ride: payload.rideId ? payload.rideId : null,
    reportedBy: credentialId,
    reportedFor: payload.reportedFor ? payload.reportedFor : null,
    reason: payload.reason,
    details: payload.details,
    ...(screenshots && { screenshots }),
  });

  return report;
};

// ✅ List reports for ADMIN, SUPERADMIN
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const listReports = async (_req: Request) => {
  const reports = await Reports.find();

  return reports;
};
const listHistories = async (req: Request) => {
  const { credentialId } = req.user as JWTCredentialProps;

  const reports = await Reports.find({ listHistories: credentialId });

  return reports;
};
const getHistory = async (req: Request) => {
  const { credentialId } = req.user as JWTCredentialProps;
  const reportId = req.params.reportId;

  const report = await Reports.findOne({
    listHistories: credentialId,
    _id: reportId,
  });

  if (!report) {
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
  }

  return report;
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
  const newScreenshots = (
    Array.isArray(req.files)
      ? req.files.map((file: Express.Multer.File) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : []
  ) as FileProps[];

  const report = (await Reports.findById(reportId)) as Report;
  if (!report) {
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
  }

  if (!payload.reportedFor && !payload.rideId) {
    throw new AppError(
      message("notFound", "ride or reported for id"),
      StatusCodes.NOT_FOUND
    );
  }

  if (payload.reportedFor) {
    const user = await Users.findById(payload.reportedFor);
    if (!user) {
      throw new AppError(message("notFound", "user"), StatusCodes.NOT_FOUND);
    }
  }
  if (payload.rideId) {
    const ride = await Rides.findById(payload.rideId);
    if (!ride) {
      throw new AppError(message("notFound", "ride"), StatusCodes.NOT_FOUND);
    }
  }

  if (report.status !== "PENDING") {
    throw new AppError(
      message("fail", "report", "You can't update the report in this stage."),
      StatusCodes.BAD_REQUEST
    );
  }

  let screenshots = [...report.screenshots, ...newScreenshots];

  const selectedScreenshots = payload.deletedScreenshots?.length
    ? new Set(payload.deletedScreenshots.map(String))
    : new Set<string>();

  if (selectedScreenshots.size) {
    const results = await Promise.all(
      screenshots.map(async (screenshot): Promise<FileProps | undefined> => {
        if (selectedScreenshots.has(screenshot.publicId)) {
          try {
            await deleteCloudinaryFile(screenshot.publicId);
          } catch (error) {
            if (error instanceof Error) {
              throw new AppError(
                message("fail", "cloudinary delete", error.message),
                StatusCodes.BAD_REQUEST
              );
            }
          }
          return undefined;
        }
        return screenshot;
      })
    );

    screenshots = results.filter(
      (screenshot): screenshot is FileProps => screenshot !== undefined
    );
  }

  const updatedReport = await Reports.findByIdAndUpdate(
    reportId,
    {
      ...payload,
      screenshots,
    },
    { runValidators: true, new: true }
  );

  return updatedReport;
};

// ✅ Update resolve the report for ADMIN, SUPERADMIN
const resolveReport = async (req: Request) => {
  const reportId = req.params.reportId;
  const payload = req.body as ResolveReportDTO;
  const report = await Reports.findById(reportId);
  if (!report) {
    throw new AppError(message("notFound", "report"), StatusCodes.NOT_FOUND);
  }

  if (payload.status === report.status) {
    throw new AppError(
      message("alreadyExists", "report status"),
      StatusCodes.BAD_REQUEST
    );
  }

  const updatedReport = await Reports.findByIdAndUpdate(
    reportId,
    {
      ...payload,
    },
    { runValidators: true, new: true }
  );
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
  listHistories,
  getHistory,
};
