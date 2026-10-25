import { BUCKET, noStore, officeAuthorized } from "@/lib/vkmRequests";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Office health check: can the website's server reach the request tables and
// the private bucket? Used by SmartDocs to explain why links can't be made.
export async function GET(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return noStore({ ok: false, error: "Supabase is not configured on the website" }, { status: 503 });

  const project = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^https:\/\/([a-z0-9]+)\..*$/, "$1");
  const tables: Record<string, string> = {};
  for (const t of ["vkm_requests", "vkm_request_files", "vkm_request_events", "leads"]) {
    // a real GET: HEAD requests don't report "table not found" reliably
    const { error } = await db.from(t).select("*").limit(1);
    tables[t] = error ? `${error.code || ""} ${error.message}`.trim() : "ok";
  }
  const { data: buckets, error: bErr } = await db.storage.listBuckets();
  const bucket = bErr ? `error: ${bErr.message}` : buckets?.some((b) => b.id === BUCKET) ? "ok" : "missing";
  const ok = bucket === "ok" && ["vkm_requests", "vkm_request_files", "vkm_request_events"].every((t) => tables[t] === "ok");
  return noStore({ ok, project, tables, bucket });
}

// Repair: create the private upload bucket if it is missing.
export async function POST(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return noStore({ ok: false, error: "Supabase is not configured on the website" }, { status: 503 });
  const { data: buckets } = await db.storage.listBuckets();
  if (buckets?.some((b) => b.id === BUCKET)) return noStore({ ok: true, bucket: "exists" });
  const { error } = await db.storage.createBucket(BUCKET, { public: false, fileSizeLimit: "25MB" });
  if (error) return noStore({ ok: false, error: error.message }, { status: 502 });
  return noStore({ ok: true, bucket: "created" });
}
