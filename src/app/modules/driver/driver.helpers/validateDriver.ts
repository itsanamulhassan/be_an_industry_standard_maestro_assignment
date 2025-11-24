import { StatusCodes } from "http-status-codes";
import AppError from "../../../helpers/error.helper";
import message from "../../../utils/message";
import { Driver } from "../driver.models";

export const validateDriver = (driver: Driver) => {
  // 404 Not Found → Driver doesn't exist
  if (!driver) {
    throw new AppError(message("notFound", "driver"), StatusCodes.NOT_FOUND);
  }

  // 404 Not Found → Vehicle information doesn't exist
  if (!driver.vehicleInfo.length) {
    throw new AppError(
      message("notFound", "vehicle information"),
      StatusCodes.NOT_FOUND
    );
  }

  // 404 Not Found → Driving license doesn't exist
  if (!driver.licenseNumber) {
    throw new AppError(
      message("notFound", "driving license"),
      StatusCodes.NOT_FOUND
    );
  }

  // 400 Bad Request → Driver activation status deactivate
  if (!driver.isActivated) {
    throw new AppError(
      message("inactivated", "Activation status"),
      StatusCodes.BAD_REQUEST
    );
  }

  // 400 Bad Request → Driver approval status deactivate
  if (!driver.isApproved) {
    throw new AppError(
      message("inactivated", "Approving status"),
      StatusCodes.BAD_REQUEST
    );
  }

  // 400 Bad Request → Driver re-approval pending status activate
  if (driver.pendingReview) {
    throw new AppError(
      message("pending", "approval status"),
      StatusCodes.BAD_REQUEST
    );
  }

  return driver;
};
