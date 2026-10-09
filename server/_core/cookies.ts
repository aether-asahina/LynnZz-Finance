import type { CookieOptions, Request } from "express";

export function getSessionCookieOptions(_req: Request): CookieOptions {
  // Aplikasi berjalan first-party di HTTPS (Vercel), jadi Lax cukup dan lebih aman dari None.
  return { httpOnly: true, path: "/", sameSite: "lax", secure: true };
}
