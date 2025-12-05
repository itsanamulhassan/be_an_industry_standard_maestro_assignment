import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { riderSchemas } from "./rider.schemas";
import { riderControllers } from "./rider.controllers";

const riderRouter = Router();

riderRouter.patch(
  "/:userId",
  validator.schema(riderSchemas.update),
  validator.role("RIDER"),
  riderControllers.updateRider
);

export default riderRouter;
