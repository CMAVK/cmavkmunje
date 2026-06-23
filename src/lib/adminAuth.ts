import crypto from "crypto";
import { cookies } from "next/headers";

// Lightweight admin auth: a single shared password (ADMIN_PASSWORD env var).
// On login we set an httpOnly cookie whose value is an HMAC of the password,
// so the raw password is never stored in the browser. Server routes verify it.

export const ADMIN_COOKIE = "vkm_admin";

function expectedToken(): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_COOKIE_SECRET || pwd;
  if (!pwd || !secret) return null;
  return crypto.createHmac("sha256", secret).update("admin:" + pwd).digest("hex");
}

export function makeAdminToken(password: string): string | null {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return null;
  // constant-time compare
  const a = Buffer.from(password);
  const b = Buffer.from(pwd);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return expectedToken();
}

export async function isAdminRequest(): Promise<boolean> {
  const expected = expectedToken();
  if (!expected) return false;
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
