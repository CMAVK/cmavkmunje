import { clientIp, noStore, sessionRequest, userAgent } from "@/lib/vkmRequests";

// Before submitting, the client may remove a file they picked by mistake.
export async function POST(req: Request) {
  const s = await sessionRequest();
  if (!s.ok) return s.res;
  const { store, r } = s;
  const { file_id } = (await req.json().catch(() => ({}))) as { file_id?: string };
  const f = (await store.listFiles(r.id)).find((x) => x.id === file_id);
  if (!f) return noStore({ error: "File not found" }, { status: 404 });
  await store.removeObjects([f.storage_path]);
  await store.deleteFiles([f.id]);
  await store.addEvent(r.id, "remove_file", clientIp(req), userAgent(req));
  return noStore({ ok: true });
}
