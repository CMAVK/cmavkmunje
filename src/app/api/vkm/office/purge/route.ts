import { effectiveStatus, getStore, noStore, officeAuthorized } from "@/lib/vkmRequests";

// Daily clean-up called by the office: files of expired, locked or cancelled
// requests that were never submitted are deleted from the cloud.
export async function POST(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { ids?: string[] };
  const ids = (Array.isArray(b.ids) ? b.ids : []).filter((s) => /^[0-9a-f-]{36}$/i.test(String(s))).slice(0, 200);
  let removed = 0;
  for (const r of await store.listRequests({ ids })) {
    const st = effectiveStatus(r);
    if (!["expired", "revoked", "locked"].includes(st)) continue;
    const files = await store.listFiles(r.id);
    if (!files.length) continue;
    await store.removeObjects(files.map((f) => f.storage_path));
    await store.deleteFiles(files.map((f) => f.id));
    removed += files.length;
  }
  return noStore({ ok: true, removed });
}
