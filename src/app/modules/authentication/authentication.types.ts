import z from "zod";
import { authenticationSchemas } from "./authentication.schemas";
export type SignInDto = z.infer<typeof authenticationSchemas.signIn>;
