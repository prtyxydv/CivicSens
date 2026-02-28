import crypto from "crypto";

export const SESSION_COOKIE_NAME = "civicsens_session";

function requireSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is required");
  }
  return secret;
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecodeToString(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  return Buffer.from(base64 + pad, "base64").toString("utf8");
}

function hmacSha256Base64Url(data) {
  const secret = requireSecret();
  const sig = crypto.createHmac("sha256", secret).update(data).digest();
  return base64UrlEncode(sig);
}

function timingSafeEqualStrings(a, b) {
  const aBuf = Buffer.from(String(a));
  const bBuf = Buffer.from(String(b));
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function signSession(payload) {
  const now = Math.floor(Date.now() / 1000);
  const safePayload =
    payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const exp = safePayload.exp ?? now + 60 * 60 * 8; // 8 hours
  const sessionPayload = { ...safePayload, iat: safePayload.iat ?? now, exp };
  const body = base64UrlEncode(JSON.stringify(sessionPayload));
  const sig = hmacSha256Base64Url(body);
  return `${body}.${sig}`;
}

export function verifySession(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  let expectedSig;
  try {
    expectedSig = hmacSha256Base64Url(body);
  } catch {
    return null;
  }
  if (!timingSafeEqualStrings(sig, expectedSig)) return null;

  try {
    const json = base64UrlDecodeToString(body);
    const payload = JSON.parse(json);
    const now = Math.floor(Date.now() / 1000);
    if (!payload?.exp || typeof payload.exp !== "number") return null;
    if (payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

export function requireRole(session, role) {
  if (!session) return false;
  if (role === "user") return session.role === "user" || session.role === "admin";
  return session.role === role;
}

