import environments from "app/configurations/environments";
import JWT, { JwtPayload, SignOptions } from "jsonwebtoken";

const signAccessToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, environments.jwt_access_secret, {
    expiresIn: environments.jwt_access_expires_in,
  } as SignOptions);
};
const signRefreshToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, environments.jwt_refresh_secret, {
    expiresIn: environments.jwt_refresh_expires_in,
  } as SignOptions);
};

const verifyAccessToken = (token: string): JwtPayload => {
  return JWT.verify(token, environments.jwt_access_secret) as JwtPayload;
};
const verifyRefreshToken = (token: string): JwtPayload => {
  return JWT.verify(token, environments.jwt_refresh_secret) as JwtPayload;
};

export const jwt = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
