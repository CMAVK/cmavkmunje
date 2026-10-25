import { BUCKET, noStore, officeAuthorized } from "@/lib/vkmRequests";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Office health check: can the website's server use the private bucket that
// holds both the uploads and the request records? Used by SmartDocs to
// explain why links can't be made.
export async function GET(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const db = getSupabaseAdmin();
  if (!db) return noStore({ ok: false, error: "Supabase is not configured on the website" }, { status: 503 });

  const project = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^https:\/\/([a-z0-9]+)\..*$/, "$1");
  const { data: buckets, error: bErr } = await db.storage.listBuckets();
  const bucket = bErr ? `error: ${bErr.message}` : buckets?.some((b) => b.id === BUCKET) ? "ok" : "missing";

  let records = "not checked";
  if (bucket === "ok") {
    const stamp = new Date().toISOString();
    const probe = `_meta/health/${Date.now()}.json`; // fresh name: never served from cache
    const { error: wErr } = await db.storage.from(BUCKET).upload(probe,
      new Blob([JSON.stringify({ stamp })], { type: "application/json" }), { upsert: true, cacheControl: "0" });
    if (wErr) records = `write failed: ${wErr.message}`;
    else {
      const { data, error: rErr } = await db.storage.from(BUCKET).download(probe);
      const back = data ? JSON.parse(await data.text()).stamp : null;
      records = rErr ? `read failed: ${rErr.message}` : back === stamp ? "ok" : "stale read";
      await db.storage.from(BUCKET).remove([probe]);
    }
  }
  return noStore({ ok: bucket === "ok" && records === "ok", project, bucket, records });
}

// Repair: create the private bucket if it is missing.
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
