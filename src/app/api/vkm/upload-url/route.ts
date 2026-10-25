import crypto from "crypto";
import {
  ALLOWED_EXT, MAX_FILE_MB, MAX_TOTAL_MB, clientIp, noStore, rateLimited, safeFileName,
  sessionRequest, userAgent,
} from "@/lib/vkmRequests";

// Hands the browser a one-time signed URL to put ONE file straight into the
// private bucket. The object name is random; the client's file name is only
// kept as data.
export async function POST(req: Request) {
  const s = await sessionRequest();
  if (!s.ok) return s.res;
  const { store, r } = s;
  if (rateLimited("up:" + r.id, 120, 60 * 60_000)) {
    return noStore({ error: "Too many uploads. Please wait a while." }, { status: 429 });
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string; size?: number; mime?: string; doc_key?: string };
  const name = safeFileName(String(body.name || ""));
  const size = Number(body.size || 0);
  const ext = (name.match(/\.[A-Za-z0-9]+$/)?.[0] || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    return noStore({ error: `"${name}": this file type is not accepted. Please send PDF, photo (JPG/PNG/HEIC) or Word (.docx).` }, { status: 400 });
  }
  if (!size || size > MAX_FILE_MB * 1024 * 1024) {
    return noStore({ error: `"${name}" is larger than ${MAX_FILE_MB} MB.` }, { status: 400 });
  }
  const docKeys = new Set(r.documents.map((d) => d.key));
  const docKey = body.doc_key && docKeys.has(body.doc_key) ? body.doc_key : null;

  const existing = await store.listFiles(r.id);
  // forget abandoned (never finished) uploads older than an hour
  const stale = existing.filter((f) => !f.confirmed && Date.now() - Date.parse(f.uploaded_at) > 3600_000);
  if (stale.length) {
    await store.removeObjects(stale.map((f) => f.storage_path));
    await store.deleteFiles(stale.map((f) => f.id));
  }
  const live = existing.filter((f) => !stale.includes(f));
  if (live.length >= r.max_files) {
    return noStore({ error: `You can send up to ${r.max_files} files on this link.` }, { status: 400 });
  }
  const total = live.reduce((a, f) => a + Number(f.size_bytes), 0) + size;
  if (total > MAX_TOTAL_MB * 1024 * 1024) {
    return noStore({ error: `Total upload limit (${MAX_TOTAL_MB} MB) reached.` }, { status: 400 });
  }

  const objectPath = `${r.id}/${crypto.randomUUID()}${ext}`;
  const mime = String(body.mime || "").slice(0, 100) || "application/octet-stream";
  const target = await store.signedUpload(objectPath, mime);
  if (!target) return noStore({ error: "Upload service is busy. Please try again." }, { status: 502 });
  const file = await store.insertFile({
    request_id: r.id, storage_path: objectPath, file_name: name, size_bytes: size, mime, doc_key: docKey,
  });
  await store.addEvent(r.id, "upload_start", clientIp(req), userAgent(req));
  return noStore({ file_id: file.id, upload_url: target.url, headers: target.headers });
}
