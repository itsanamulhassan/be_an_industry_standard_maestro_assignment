import { Response } from "express";
import { RemoveCookiesProps, SetCookiesProps } from "../types/utils.types";
import env from "../configurations/env";

const defaultCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // secure only in production
  sameSite: "lax" as const,
};

const { access_cookie_name, refresh_cookie_name } = env;

export const setCookies = (res: Response, payload: SetCookiesProps): void => {
  if (payload?.accessToken) {
    res.cookie(access_cookie_name, payload.accessToken, {
      ...defaultCookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day for access token
    });
  }

  if (payload?.refreshToken) {
    res.cookie(refresh_cookie_name, payload.refreshToken, {
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
    res.clearCookie(access_cookie_name, defaultCookieOptions);
  }

  if (payload?.refreshToken) {
    res.clearCookie(refresh_cookie_name, defaultCookieOptions);
  }
};

export const cookies = {
  setCookies,
  removeCookies,
};
