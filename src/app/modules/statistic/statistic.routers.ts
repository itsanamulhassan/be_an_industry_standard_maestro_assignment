import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { statisticControllers } from "./statistic.controllers";

const statisticRouter = Router();
statisticRouter.get(
  "/driver",
  validator.role("DRIVER", "ADMIN", "SUPERADMIN"),
  statisticControllers.getDriverStatistic
);
statisticRouter.get(
  "/rider",
  validator.role("RIDER", "ADMIN", "SUPERADMIN"),
  statisticControllers.getRiderStatistic
);

statisticRouter.get(
  "/",
  validator.role("ADMIN", "SUPERADMIN"),
  statisticControllers.getAdminStatistic
);

export default statisticRouter;
