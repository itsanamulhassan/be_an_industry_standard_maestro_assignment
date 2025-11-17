import { UserRoleEnumDTO } from "../modules/user/user.types";

export interface SetCookiesProps {
  accessToken?: string;
  refreshToken?: string;
}
export interface RemoveCookiesProps {
  accessToken?: boolean;
  refreshToken?: boolean;
}

export interface CreateAccessRefreshTokenProps {
  credentialId: string;
  email: string;
  role: UserRoleEnumDTO;
}

export interface MailSenderProps<T> {
  subject: string;
  to: string;
  template: string;
  data?: T;
  attachments?: {
    filename: string;
    content: string | Buffer<ArrayBufferLike>;
    contentType: string;
  }[];
}
