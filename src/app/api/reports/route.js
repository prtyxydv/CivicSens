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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
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

  // Use body AI if provided (confirmed by user), else regenerate
  const ai = body?.ai || analyzeInput(description);
  const ticketId = makeTicketId();

  const payload = {
    ticket_id: ticketId,
    category: ai.cat,
    description,
    image_url: imageUrl,
    status: "Submitted",
    priority_level: ai.prio,
    severity_score: ai.score || 0,
    department: ai.dept || "Unassigned",
    risk_assessment: ai.msg,
    latitude,
    longitude,
    email: email
  };

  const attemptInsert = async (p) =>
    await supabase.from("reports").insert([p]).select("*").single();

  let insertResult = await attemptInsert(payload);
  
  if (insertResult.error) {
    const msg = String(insertResult.error.message || "");
    // Fallback if column 'email' doesn't exist but 'reporter_email' does
    if (/email/i.test(msg) || /column/i.test(msg)) {
      const { email: _, ...rest } = payload;
      insertResult = await attemptInsert({ ...rest, reporter_email: email });
    }
  }

  if (insertResult.error) {
    return jsonError(`Insert failed: ${insertResult.error.message}`, 500);
  }

  // Ensure returning email field consistently for the UI
  const finalData = insertResult.data;
  if (!finalData.email && finalData.reporter_email) {
    finalData.email = finalData.reporter_email;
  }

  return NextResponse.json({
    ok: true,
    report: finalData,
    ai,
  });
}
