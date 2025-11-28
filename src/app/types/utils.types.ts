import { UserRoleEnumDTO } from "../modules/user/user.types";

export interface SetCookiesProps {
  accessToken?: string;
  refreshToken?: string;
}
export interface RemoveCookiesProps {
  accessToken?: boolean;
  refreshToken?: boolean;
}

export interface JWTCredentialProps {
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CalculateDistanceKmProps {
  pickup: Coordinates;
  destination: Coordinates;
}

export interface CalculateEtaMinutesProps {
  driver: Coordinates;
  pickup: Coordinates;
  speed?: number;
}

export interface CalculateFareProps {
  distanceKm: number;
  durationMin: number;
  baseFare?: number;
  perKmRate?: number;
  perMinuteRate?: number;
  minFare?: number;
  surgeMultiplier?: number;
}
