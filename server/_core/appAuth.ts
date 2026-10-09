import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { eq } from "drizzle-orm";
import { authSessions, type User } from "../../drizzle/schema";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";

const scrypt = promisify(scryptCallback);
export const APP_SESSION_COOKIE = "lynnzz_session";
const USER_SESSION_MS = 1000 * 60 * 60 * 24 * 30;
const GUEST_SESSION_MS = 1000 * 60 * 60 * 24;

type AppSession = { user: User; isGuest: boolean };

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hash) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hash, "hex");
  return expected.length === derived.length && timingSafeEqual(expected, derived);
}

export function emailOpenId(email: string) {
  return `em_${createHash("sha256").update(normalizeEmail(email)).digest("hex").slice(0, 61)}`;
}

export function validateCredentials(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new Error("Masukkan email yang valid.");
  if (password.length < 8) throw new Error("Password minimal 8 karakter.");
  return normalizedEmail;
}

function sessionCookieOptions(maxAge: number) {
  return { ...getSessionCookieOptions({} as Request), maxAge };
}

export async function setAppSession(res: Response, user: User, isGuest = false) {
  const rawToken = randomBytes(32).toString("base64url");
  const database = await db.getDb();
  if (!database) throw new Error("Database belum tersedia. Coba lagi sebentar.");
  await database.insert(authSessions).values({
    tokenHash: hashToken(rawToken),
    userId: isGuest ? null : user.id,
    isGuest: isGuest ? 1 : 0,
    expiresAt: new Date(Date.now() + (isGuest ? GUEST_SESSION_MS : USER_SESSION_MS)),
  });
  res.cookie(APP_SESSION_COOKIE, rawToken, sessionCookieOptions(isGuest ? GUEST_SESSION_MS : USER_SESSION_MS));
}

export async function getAppSession(req: Request): Promise<AppSession | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const rawToken = cookies[APP_SESSION_COOKIE];
  if (!rawToken) return null;
  const database = await db.getDb();
  if (!database) return null;
  const rows = await database.select().from(authSessions).where(eq(authSessions.tokenHash, hashToken(rawToken))).limit(1);
  const session = rows[0];
  if (!session || session.expiresAt.getTime() <= Date.now()) {
    if (session) await database.delete(authSessions).where(eq(authSessions.id, session.id));
    return null;
  }
  if (session.isGuest || !session.userId) {
    // Tiap sesi tamu memakai id negatif unik, supaya workspace tamu tidak dipakai bersama
    // oleh semua pengunjung (sebelumnya semua tamu berbagi ownerId -1).
    return { isGuest: true, user: { ...db.createGuestUser(), id: -session.id } };
  }
  const user = await db.getUserById(session.userId);
  return user ? { isGuest: false, user } : null;
}

export async function clearAppSession(req: Request, res: Response) {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const rawToken = cookies[APP_SESSION_COOKIE];
  const database = await db.getDb();
  if (database && rawToken) await database.delete(authSessions).where(eq(authSessions.tokenHash, hashToken(rawToken)));
  if (rawToken) res.clearCookie(APP_SESSION_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export async function createEmailUser(email: string, name: string, password: string) {
  const normalizedEmail = validateCredentials(email, password);
  const existing = await db.getUserByEmail(normalizedEmail);
  if (existing) throw new Error("Email ini sudah terdaftar. Silakan masuk.");
  const user = await db.insertEmailUser({ email: normalizedEmail, name: name.trim() || normalizedEmail.split("@")[0], passwordHash: await hashPassword(password) });
  return user;
}

export async function authenticateEmail(email: string, password: string) {
  const normalizedEmail = validateCredentials(email, password);
  const user = await db.getUserByEmail(normalizedEmail);
  if (!user?.passwordHash || !(await verifyPassword(password, user.passwordHash))) throw new Error("Email atau password tidak sesuai.");
  await db.touchUser(user.openId);
  return (await db.getUserByEmail(normalizedEmail)) ?? user;
}
