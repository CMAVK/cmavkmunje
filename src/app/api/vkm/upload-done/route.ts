import { clientIp, noStore, sessionRequest, userAgent } from "@/lib/vkmRequests";

// The browser says an upload finished; we only believe it once the object is
// really in the bucket.
export async function POST(req: Request) {
  const s = await sessionRequest();
  if (!s.ok) return s.res;
  const { store, r } = s;
  const { file_id } = (await req.json().catch(() => ({}))) as { file_id?: string };
  const f = (await store.listFiles(r.id)).find((x) => x.id === file_id);
  if (!f) return noStore({ error: "File not found" }, { status: 404 });
  if (!(await store.objectExists(f.storage_path))) {
    return noStore({ error: `"${f.file_name}" did not finish uploading. Please try again.` }, { status: 409 });
  }
  await store.updateFile(f.id, { confirmed: true });
  await store.addEvent(r.id, "upload", clientIp(req), userAgent(req));
  return noStore({ ok: true, file: { id: f.id, name: f.file_name, size: f.size_bytes, doc_key: f.doc_key } });
}
