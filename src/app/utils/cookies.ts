import { Response } from "express";
import environments from "../configurations/environments";
import { RemoveCookiesProps, SetCookiesProps } from "../types/utils.types";

const defaultCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // secure only in production
  sameSite: "lax" as const,
};

const {
  cookie: { access, refresh },
} = environments;

export const setCookies = (res: Response, payload: SetCookiesProps): void => {
  if (payload?.accessToken) {
    res.cookie(access, payload.accessToken, {
      ...defaultCookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day for access token
    });
  }

  if (payload?.refreshToken) {
    res.cookie(refresh, payload.refreshToken, {
      ...defaultCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
    });
  }
};

export const removeCookies = (
  res: Response,
  payload: RemoveCookiesProps
): void => {
  if (payload?.accessToken) {
    res.clearCookie(access, defaultCookieOptions);
  }

  if (payload?.refreshToken) {
    res.clearCookie(refresh, defaultCookieOptions);
  }
};

export const cookies = {
  setCookies,
  removeCookies,
};
