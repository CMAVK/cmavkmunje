import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/adminAuth";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 503 });

  const { data, error } = await db
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Generate short-lived signed download URLs for each file.
  const docs = await Promise.all(
    (data || []).map(async (d) => {
      const { data: signed } = await db.storage
        .from("documents")
        .createSignedUrl(d.file_path, 60 * 10); // 10 minutes
      return { ...d, url: signed?.signedUrl || null };
    })
  );

  return NextResponse.json({ documents: docs });
}
