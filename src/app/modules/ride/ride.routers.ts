import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { rideSchemas } from "./ride.schemas";
import { rideControllers } from "./ride.controllers";
import { userRoleEnum } from "../user/user.schemas";

const rideRouter = Router();

rideRouter.post(
  "/",
  validator.schema(rideSchemas.create),
  validator.role("RIDER"),
  rideControllers.createRide
);
rideRouter.patch(
  "/:rideId/cancel",
  validator.schema(rideSchemas.cancel),
  validator.role(...userRoleEnum),
  rideControllers.updateCancel
);
rideRouter.patch(
  "/:rideId/accept",
  validator.role("DRIVER"),
  rideControllers.updateAccept
);
rideRouter.patch(
  "/:rideId/status",
  validator.schema(rideSchemas.status),
  validator.role("DRIVER"),
  rideControllers.updateStatus
);
rideRouter.get(
  "/history",
  validator.role("DRIVER", "RIDER"),
  rideControllers.listHistories
);
rideRouter.get(
  "/:rideId/history",
  validator.role("DRIVER", "RIDER"),
  rideControllers.getHistory
);

rideRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  rideControllers.listRides
);
rideRouter.get(
  "/:rideId",
  validator.role("ADMIN", "SUPERADMIN"),
  rideControllers.getRide
);

export default rideRouter;
