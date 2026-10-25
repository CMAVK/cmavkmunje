import { getStore, noStore, officeAuthorized } from "@/lib/vkmRequests";

// The office has safely stored these files: delete them from the cloud.
// When every file is collected, the request is marked synced.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const { id } = await ctx.params;
  const r = await store.findRequest({ id });
  if (!r) return noStore({ error: "not found" }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as { file_ids?: string[] };
  const done = new Set(Array.isArray(b.file_ids) ? b.file_ids : []);
  const files = await store.listFiles(id);
  const collected = files.filter((f) => done.has(f.id));
  await store.removeObjects(collected.map((f) => f.storage_path));
  await store.deleteFiles(collected.map((f) => f.id));
  const left = files.filter((f) => f.confirmed && !done.has(f.id)).length;
  if (!left) await store.updateRequest(id, { synced_at: new Date().toISOString() });
  await store.addEvent(id, "synced", "office", "");
  return noStore({ ok: true, removed: collected.length, remaining: left });
}
