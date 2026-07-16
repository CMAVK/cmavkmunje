// TEMPORARY diagnostic — verifies chat-lead saving end-to-end. DELETE after use.
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const SECRET = "vkm-diag-7c2f91e4";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("key") !== SECRET) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ configured: false });

  const { data, error } = await db
    .from("leads")
    .select("source,name,phone,service,created_at")
    .eq("source", "chat")
    .order("created_at", { ascending: false })
    .limit(3);

  return NextResponse.json({ configured: true, error: error?.message ?? null, recentChatLeads: data });
}
