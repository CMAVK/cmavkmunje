import { getStore, noStore, officeAuthorized } from "@/lib/vkmRequests";

// Submitted requests the office has not collected yet, with 10-minute
// download links for each file.
export async function GET(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });

  const rows = await store.listRequests({ submittedUnsynced: true });
  const out = [];
  for (const r of rows) {
    const files = (await store.listFiles(r.id)).filter((f) => f.confirmed && !f.synced_at);
    out.push({
      id: r.id, client_code: r.client_code, client_name: r.client_name, title: r.title,
      submitted_at: r.submitted_at, services: r.client_services, message: r.client_message,
      contact: r.client_contact, intake_id: r.intake_id ?? null,
      files: await Promise.all(files.map(async (f) => ({
        id: f.id, name: f.file_name, size: f.size_bytes, mime: f.mime, doc_key: f.doc_key,
        url: await store.signedDownload(f.storage_path, 600),
      }))),
    });
  }
  return noStore({ requests: out });
}
