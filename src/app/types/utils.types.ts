import { UserRoleStatusEnumProps } from "app/modules/user/user.type";
import { Types } from "mongoose";

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
  role: UserRoleStatusEnumProps;
}
