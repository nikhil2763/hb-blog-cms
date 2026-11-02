import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, sessionCookieOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILURES = 5;
const failures = new Map();

function isLocked(ip) {
  const rec = failures.get(ip);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    failures.delete(ip);
    return false;
  }
  return rec.count >= MAX_FAILURES;
}

function recordFailure(ip) {
  const rec = failures.get(ip) || { count: 0, first: Date.now() };
  rec.count++;
  failures.set(ip, rec);
}

// Constant-time comparison so response timing does not leak how much of a value matched.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function POST(req) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (isLocked(ip)) {
    return NextResponse.json({ error: "Too many failed attempts. Try again in 15 minutes." }, { status: 429 });
  }

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !process.env.AUTH_SECRET) {
    return NextResponse.json({ error: "Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and AUTH_SECRET in .env." }, { status: 500 });
  }

  const body = await req.json().catch(() => ({}));
  const userOk = safeEqual(body.username ?? "", expectedUser);
  const passOk = safeEqual(body.password ?? "", expectedPass);
  if (!userOk || !passOk) {
    recordFailure(ip);
    return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
  }

  failures.delete(ip);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(expectedUser), sessionCookieOptions);
  return res;
}
