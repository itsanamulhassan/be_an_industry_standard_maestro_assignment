import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { driverSchemas } from "./driver.schemas";
import { driverControllers } from "./driver.controllers";

const driverRouter = Router();

driverRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.listDrivers
);
driverRouter.get(
  "/:driverId",
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.getDriver
);

driverRouter.post(
  "/:userId",
  validator.schema(driverSchemas.create),
  validator.role("RIDER", "ADMIN", "SUPERADMIN"),
  driverControllers.createDriver
);
driverRouter.patch(
  "/:userId/approve",
  validator.schema(driverSchemas.updateApproval),
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.updateApproval
);
driverRouter.patch(
  "/:userId/online",
  validator.schema(driverSchemas.updateOnline),
  validator.role("DRIVER", "ADMIN", "SUPERADMIN"),
  driverControllers.updateOnline
);
driverRouter.patch(
  "/:userId/activation",
  validator.schema(driverSchemas.updateActivation),
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.updateActivation
);
driverRouter.patch(
  "/:userId",
  validator.schema(driverSchemas.update),
  validator.role("DRIVER", "ADMIN", "SUPERADMIN"),
  driverControllers.updateDriver
);

driverRouter.delete(
  "/:driverId",
  validator.role("ADMIN", "SUPERADMIN"),
  driverControllers.deleteDriver
);

export default driverRouter;
