import { UserRoleStatusEnumDto } from "app/modules/user/user.types";
import { JwtPayload } from "jsonwebtoken";
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
