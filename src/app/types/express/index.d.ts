import { UserRoleEnumDTO } from "../../modules/user/user.types";

export interface JWTCredentialProps {
  credentialId: string;
  email: string;
  role: UserRoleEnumDTO;
}
declare global {
  namespace Express {
    interface Request {
      user: JWTCredentialProps;
    }
  }
}
