import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

export async function GET() {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  return NextResponse.json({ ok: true, session: session || null });
}

