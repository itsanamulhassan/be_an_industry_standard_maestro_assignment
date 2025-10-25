import { Router } from "express";
import { validator } from "../../middlewares/validator.middleware";
import { otpSchemas } from "./otp.schemas";
import { otpControllers } from "./otp.controllers";

const otpRouter = Router();

otpRouter.post("/send", validator.schema(otpSchemas.send), otpControllers.send);
otpRouter.post(
  "/verify",
  validator.schema(otpSchemas.verify),
  otpControllers.verify
);

export default otpRouter;
