import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { driverSchemas } from "./driver.schemas";
import { driverControllers } from "./driver.controllers";

const driverRouter = Router();

driverRouter.post(
  "/create/:id",
  validator.schema(driverSchemas.create),
  validator.role("RIDER", "ADMIN", "SUPERADMIN"),
  driverControllers.createDriver
);
driverRouter.patch(
  "/update/approve/:id",
  validator.schema(driverSchemas.updateApproval),
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.updateApproval
);
driverRouter.patch(
  "/update/online/:id",
  validator.schema(driverSchemas.updateOnline),
  validator.role("DRIVER", "ADMIN", "SUPERADMIN"),
  driverControllers.updateOnline
);
driverRouter.patch(
  "/update/activation/:id",
  validator.schema(driverSchemas.updateActivation),
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.updateActivation
);
driverRouter.patch(
  "/update/:id",
  validator.schema(driverSchemas.update),
  validator.role("DRIVER", "ADMIN", "SUPERADMIN"),
  driverControllers.updateDriver
);

export default driverRouter;
