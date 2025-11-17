import { JWTCredentialProps } from "../utils.types";

declare global {
  namespace Express {
    interface Request {
      user: JWTCredentialProps;
    }
  }
}
