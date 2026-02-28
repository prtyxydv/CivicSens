import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  cookieOptions,
  signSession,
} from "@/lib/auth";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const rawRole = body?.role === "admin" ? "admin" : "user";
  const email = String(body?.email || "")
    .trim()
    .toLowerCase();
  const password = String(body?.password || "");

  if (!email) return jsonError("Email is required");
  if (!isValidEmail(email)) return jsonError("Enter a valid email");

  if (rawRole === "admin") {
    const adminEmail = String(process.env.ADMIN_EMAIL || "")
      .trim()
      .toLowerCase();
    const adminPassword = String(process.env.ADMIN_PASSWORD || "");
    if (!adminEmail || !adminPassword) {
      return jsonError(
        "Admin auth is not configured (ADMIN_EMAIL / ADMIN_PASSWORD)",
        500,
      );
    }
    if (email !== adminEmail || password !== adminPassword) {
      return jsonError("Invalid admin credentials", 401);
    }
  }

  let token;
  try {
    token = signSession({ role: rawRole, email });
  } catch (e) {
    return jsonError(e?.message || "Auth is not configured", 500);
  }
  const res = NextResponse.json({ ok: true, role: rawRole, email });
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    ...cookieOptions(),
    maxAge: 60 * 60 * 8,
  });
  return res;
}

