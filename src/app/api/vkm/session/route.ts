import { ALLOWED_EXT, MAX_FILE_MB, SESSION_MINUTES, noStore, sessionRequest } from "@/lib/vkmRequests";

// Everything the signed-in client needs to see: what the firm asked for,
// the services on offer, and the files uploaded so far.
export async function GET() {
  const s = await sessionRequest();
  if (!s.ok) return s.res;
  const { store, r } = s;
  const files = (await store.listFiles(r.id)).filter((f) => f.confirmed);
  return noStore({
    client_name: r.client_name,
    client_code: r.intake_id ? null : r.client_code,
    title: r.title,
    documents: r.documents,
    services: r.services,
    max_files: r.max_files,
    max_file_mb: MAX_FILE_MB,
    allowed_ext: ALLOWED_EXT,
    expires_at: r.expires_at,
    session_minutes: SESSION_MINUTES,
    files: files.map((f) => ({ id: f.id, name: f.file_name, size: f.size_bytes, doc_key: f.doc_key })),
  });
}
