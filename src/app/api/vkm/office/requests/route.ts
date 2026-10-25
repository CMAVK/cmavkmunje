import {
  effectiveStatus, getStore, hashPin, hashToken, newPin, newToken, noStore, officeAuthorized, siteBase,
  type DocItem,
} from "@/lib/vkmRequests";

// Office (VKM SmartDocs) side, behind "Authorization: Bearer <CRM_SYNC_TOKEN>".

// Create a request. The link token and PIN are returned ONCE — only hashes
// are stored here.
export async function POST(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });

  const b = (await req.json().catch(() => ({}))) as {
    client_code?: string; client_name?: string; title?: string; documents?: DocItem[];
    services?: string[]; days?: number; created_by?: string; max_files?: number;
  };
  const code = String(b.client_code || "").trim().toUpperCase();
  const name = String(b.client_name || "").trim();
  if (!/^[A-Z0-9-]{3,20}$/.test(code) || !name) {
    return noStore({ error: "client_code and client_name are required" }, { status: 400 });
  }
  const days = Math.max(1, Math.min(Number(b.days) || 7, 60));
  const documents = (Array.isArray(b.documents) ? b.documents : []).slice(0, 40).map((d) => ({
    key: String(d.key || "").slice(0, 60), label: String(d.label || d.key || "").slice(0, 120),
    note: String(d.note || "").slice(0, 200),
  })).filter((d) => d.key && d.label);
  const services = (Array.isArray(b.services) ? b.services : []).map((s) => String(s).trim().slice(0, 80))
    .filter(Boolean).slice(0, 30);

  const token = newToken();
  const pin = newPin();
  const { hash, salt } = hashPin(pin);
  const r = await store.insertRequest({
    token_hash: hashToken(token), client_code: code, client_name: name.slice(0, 150),
    title: String(b.title || "Document Submission").slice(0, 120), documents, services,
    pin_hash: hash, pin_salt: salt, max_files: Math.max(1, Math.min(Number(b.max_files) || 25, 50)),
    expires_at: new Date(Date.now() + days * 86400_000).toISOString(),
    created_by: String(b.created_by || "").slice(0, 50) || null,
  });
  await store.addEvent(r.id, "created", "office", "");
  return noStore({
    id: r.id, url: `${siteBase(req)}/vkm/${token}`, login_url: `${siteBase(req)}/vkm`,
    pin, expires_at: r.expires_at,
  }, { status: 201 });
}

// Current state of the given requests (?ids=a,b,c).
export async function GET(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",")
    .map((s) => s.trim()).filter((s) => /^[0-9a-f-]{36}$/i.test(s)).slice(0, 200);
  const rows = await store.listRequests({ ids });
  return noStore({
    requests: rows.map((r) => ({
      id: r.id, status: effectiveStatus(r), failed_attempts: r.failed_attempts,
      submitted_at: r.submitted_at, synced_at: r.synced_at, expires_at: r.expires_at,
    })),
  });
}
