import JWT, { JwtPayload, SignOptions } from "jsonwebtoken";
import environments from "../../../configurations/environments";

const signAccessToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, environments.jwt.access_secret, {
    expiresIn: environments.jwt.access_secret_expires_in,
  } as SignOptions);
};
const signRefreshToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, environments.jwt.refresh_secret, {
    expiresIn: environments.jwt.refresh_secret_expires_in,
  } as SignOptions);
};

const verifyAccessToken = (token: string): JwtPayload => {
  return JWT.verify(token, environments.jwt.access_secret) as JwtPayload;
};
const verifyRefreshToken = (token: string): JwtPayload => {
  return JWT.verify(token, environments.jwt.refresh_secret) as JwtPayload;
};

export const jwt = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
