import JWT, { JwtPayload, SignOptions } from "jsonwebtoken";
import env from "../configurations/env";

const signAccessToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, env.jwt_access_secret, {
    expiresIn: env.jwt_access_expires_in,
  } as SignOptions);
};
const signRefreshToken = (payload: JwtPayload): string => {
  return JWT.sign(payload, env.jwt_refresh_secret, {
    expiresIn: env.jwt_refresh_expires_in,
  } as SignOptions);
};

const verifyAccessToken = (token: string): JwtPayload => {
  return JWT.verify(token, env.jwt_access_secret) as JwtPayload;
};
const verifyRefreshToken = (token: string): JwtPayload => {
  return JWT.verify(token, env.jwt_refresh_secret) as JwtPayload;
};

export const jwt = {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
};
