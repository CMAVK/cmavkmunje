import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Read-only feed of website enquiries for the office CRM (VKM SmartDocs).
// SmartDocs polls this with "Authorization: Bearer <CRM_SYNC_TOKEN>" so the
// office PC never needs the Supabase service-role key. Without the env var
// the endpoint refuses everyone.

function isAuthorized(req: Request): boolean {
  const secret = process.env.CRM_SYNC_TOKEN;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") || "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "not configured" }, { status: 503 });

  const since = new URL(req.url).searchParams.get("since");
  let query = db
    .from("leads")
    .select("id,source,name,email,phone,company,service,date,time,message,created_at")
    .order("created_at", { ascending: true })
    .limit(500);
  if (since && !Number.isNaN(Date.parse(since))) query = query.gt("created_at", since);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 502 });
  return NextResponse.json({ leads: data ?? [] });
}
