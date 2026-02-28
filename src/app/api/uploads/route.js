import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { SESSION_COOKIE_NAME, verifySession } from "@/lib/auth";

function jsonError(message, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function safeFilename(name) {
  return String(name || "upload")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
}

export async function POST(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySession(token);
  if (!session) return jsonError("Unauthorized", 401);

  const form = await request.formData().catch(() => null);
  if (!form) return jsonError("Invalid form data");

  const file = form.get("file");
  if (!file) return jsonError("File is required");
  if (typeof file === "string") return jsonError("Invalid file");

  const bucket =
    process.env.SUPABASE_REPORT_IMAGES_BUCKET?.trim() || "report-images";

  let buffer;
  try {
    buffer = Buffer.from(await file.arrayBuffer());
  } catch {
    return jsonError("Could not read uploaded file");
  }

  const ext = safeFilename(file.name).split(".").pop();
  const key = `reports/${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${
    ext || "bin"
  }`;

  let supabase;
  try {
    supabase = getSupabaseAdmin();
  } catch (e) {
    return jsonError(e?.message || "Server Supabase is not configured", 500);
  }

  const { error } = await supabase.storage
    .from(bucket)
    .upload(key, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    return jsonError(
      `Upload failed: ${error.message}. Ensure the bucket "${bucket}" exists.`,
      500,
    );
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(key);
  return NextResponse.json({ ok: true, path: key, publicUrl: data.publicUrl });
}

