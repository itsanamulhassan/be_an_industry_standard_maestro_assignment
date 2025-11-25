import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { rideSchemas } from "./ride.schemas";
import { rideControllers } from "./ride.controllers";
import { userRoleEnum } from "../user/user.schemas";

const rideRouter = Router();

rideRouter.post(
  "/create",
  validator.schema(rideSchemas.create),
  validator.role("RIDER"),
  rideControllers.createRide
);
rideRouter.patch(
  "/cancel/:rideId",
  validator.schema(rideSchemas.cancel),
  validator.role(...userRoleEnum),
  rideControllers.updateCancel
);
rideRouter.patch(
  "/accept/:rideId",
  validator.role("DRIVER"),
  rideControllers.updateAccept
);
rideRouter.patch(
  "/status/:rideId",
  validator.schema(rideSchemas.status),
  validator.role("DRIVER"),
  rideControllers.updateStatus
);
rideRouter.patch(
  "/report/:rideId",
  validator.schema(rideSchemas.report),
  validator.role("DRIVER", "RIDER"),
  rideControllers.updateReport
);
rideRouter.get(
  "/history",
  validator.role("DRIVER", "RIDER"),
  rideControllers.retrieveHistories
);

rideRouter.get("/", validator.role("ADMIN", "SUPERADMIN"));

export default rideRouter;
