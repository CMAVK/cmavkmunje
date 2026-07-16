import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Keep-alive heartbeat: touched daily by Vercel Cron (see vercel.json) so the
// free-tier Supabase project never pauses from inactivity. The query is a
// trivial count — no data is read or returned.
export async function GET() {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, reason: "not configured" }, { status: 500 });

  const { error } = await db.from("reviews").select("id", { count: "exact", head: true });
  if (error) return NextResponse.json({ ok: false, reason: error.message }, { status: 502 });

  return NextResponse.json({ ok: true });
}
