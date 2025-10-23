import { UserRoleStatusEnumDto } from "../../modules/user/user.types";

export interface JWTCredentialProps {
  credentialId: string;
  email: string;
  role: UserRoleStatusEnumDto;
}
declare global {
  namespace Express {
    interface Request {
      user: JWTCredentialProps;
    }
  }
}
