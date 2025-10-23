import z from "zod";
import { otpSchemas } from "./otp.schemas";

export type VerifyOTPDto = z.infer<typeof otpSchemas.verify>;
export type SendOTPDto = z.infer<typeof otpSchemas.send>;
