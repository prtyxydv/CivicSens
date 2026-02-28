import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { analyzeInput } from "@/lib/analyze";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function makeTicketId() {
  return `CS-${Math.floor(10000 + Math.random() * 90000)}`;
}

export async function GET(request) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) return jsonError("Unauthorized", 401);

  const url = new URL(request.url);
  const ticketId = url.searchParams.get("ticket_id")?.trim()?.toUpperCase();
  if (!ticketId) return jsonError("ticket_id is required");

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return jsonError(e?.message || "Server Supabase is not configured", 500);
  }

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("ticket_id", ticketId)
    .single();

  if (error) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true, report: data });
}

export async function POST(request) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) return jsonError("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const description = String(body?.description || "").trim();
  const latitude = body?.latitude ?? null;
  const longitude = body?.longitude ?? null;
  const imageUrl = String(body?.imageUrl || body?.image_url || "").trim();
  const email = String(body?.email || session.email || "").trim().toLowerCase();

  if (!description) return jsonError("Description is required");

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return jsonError(e?.message || "Server Supabase is not configured", 500);
  }

  const ai = analyzeInput(description);
  const ticketId = makeTicketId();

  const basePayload = {
    ticket_id: ticketId,
    category: ai.cat,
    description,
    image_url: imageUrl,
    status: "Submitted",
    priority_level: ai.prio,
    risk_assessment: ai.msg,
    latitude,
    longitude,
  };

  const payloadWithEmail = email
    ? { ...basePayload, reporter_email: email }
    : basePayload;

  const attemptInsert = async (payload) =>
    await supabase.from("reports").insert([payload]).select("*").single();

  let insertResult = await attemptInsert(payloadWithEmail);
  if (insertResult.error && payloadWithEmail.reporter_email) {
    // If the DB doesn't have reporter_email column, retry without it.
    const msg = String(insertResult.error.message || "");
    if (/reporter_email/i.test(msg) || /column/i.test(msg)) {
      insertResult = await attemptInsert(basePayload);
    }
  }

  if (insertResult.error) {
    return jsonError(`Insert failed: ${insertResult.error.message}`, 500);
  }

  return NextResponse.json({
    ok: true,
    report: insertResult.data,
    ai,
  });
}

