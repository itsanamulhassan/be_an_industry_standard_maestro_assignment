import { Types } from "mongoose";
import { UserRoleStatusEnumDto } from "../modules/user/user.types";

export interface SetCookiesProps {
  accessToken?: string;
  refreshToken?: string;
}
export interface RemoveCookiesProps {
  accessToken?: boolean;
  refreshToken?: boolean;
}

export interface CreateAccessRefreshTokenProps {
  credentialId: Types.ObjectId;
  email: string;
  role: UserRoleStatusEnumDto;
}
