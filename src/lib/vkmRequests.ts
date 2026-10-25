// Server-only: never import into a client component.
import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Secure client document requests (cmavkmunje.com/vkm/<token>).
//
// How a request is protected:
//  - the link token is 24 random bytes; only its SHA-256 is stored, so a
//    database leak does not reveal working links
//  - opening the link is not enough: the client must also enter a 6-digit PIN
//    the firm sends separately; 5 wrong PINs lock the request
//  - after the PIN, a short-lived signed httpOnly cookie is the session
//  - files go straight to a private bucket through one-time signed upload URLs
//  - once the client submits, the request is closed for good until the firm
//    reopens it (which also issues a new PIN)
//  - the office PC (VKM SmartDocs) pulls submitted files, then they are
//    deleted from the cloud
//
// Data lives in Supabase (supabase-vkm-requests.sql). For local testing only,
// VKM_DEV_STORE=1 under `next dev` keeps everything in ./.vkm-dev instead.

export const BUCKET = "client-requests";
export const MAX_FILE_MB = 25;
export const MAX_TOTAL_MB = 300;
export const MAX_PIN_ATTEMPTS = 5;
export const SESSION_MINUTES = 45;
export const ALLOWED_EXT = [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".docx", ".csv", ".txt"];
const SESSION_COOKIE = "vkm_req";

export type DocItem = { key: string; label: string; note?: string };
export type RequestStatus = "open" | "submitted" | "locked" | "revoked";

export type VkmRequest = {
  id: string;
  token_hash: string;
  client_code: string;
  client_name: string;
  title: string;
  documents: DocItem[];
  services: string[];
  pin_hash: string;
  pin_salt: string;
  failed_attempts: number;
  status: RequestStatus;
  max_files: number;
  expires_at: string;
  created_by: string | null;
  created_at: string;
  submitted_at: string | null;
  client_services: string[];
  client_message: string | null;
  client_contact: Record<string, string>;
  synced_at: string | null;
};

export type VkmFile = {
  id: string;
  request_id: string;
  storage_path: string;
  file_name: string;
  size_bytes: number;
  mime: string | null;
  doc_key: string | null;
  confirmed: boolean;
  uploaded_at: string;
  synced_at: string | null;
};

type NewRequest = Omit<VkmRequest, "id" | "created_at" | "failed_attempts" | "status" | "submitted_at" |
  "client_services" | "client_message" | "client_contact" | "synced_at">;
type NewFile = Omit<VkmFile, "id" | "uploaded_at" | "synced_at" | "confirmed">;

interface Store {
  insertRequest(r: NewRequest): Promise<VkmRequest>;
  findRequest(by: { id?: string; token_hash?: string; client_code?: string }): Promise<VkmRequest | null>;
  updateRequest(id: string, patch: Partial<VkmRequest>): Promise<void>;
  listRequests(f: { submittedUnsynced?: boolean; ids?: string[] }): Promise<VkmRequest[]>;
  insertFile(f: NewFile): Promise<VkmFile>;
  listFiles(requestId: string): Promise<VkmFile[]>;
  updateFile(id: string, patch: Partial<VkmFile>): Promise<void>;
  deleteFiles(ids: string[]): Promise<void>;
  addEvent(requestId: string | null, event: string, ip: string, ua: string): Promise<void>;
  signedUpload(objectPath: string, mime: string): Promise<{ url: string; headers: Record<string, string> } | null>;
  objectExists(objectPath: string): Promise<boolean>;
  signedDownload(objectPath: string, seconds: number): Promise<string | null>;
  removeObjects(paths: string[]): Promise<void>;
}

// ── Supabase store (production) ─────────────────────────────────────────────
// Request records are small private JSON files in the same private bucket as
// the uploads (under _meta/), read and written only with the service-role
// key. This avoids depending on Supabase's Data API exposing new tables.
//   _meta/requests/<id>.json      the request + its files
//   _meta/tokens/<token_hash>.json -> { id }
//   _meta/codes/<CLIENT_CODE>.json -> { id } of the newest request
//   _meta/inbox/<id>.json          present while submitted and not yet collected
//   _meta/events/<id>/<time>.json  audit trail
type Rec = VkmRequest & { files: VkmFile[] };
const META = "_meta";

function supabaseStore(): Store | null {
  const db = getSupabaseAdmin();
  if (!db) return null;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const bucket = () => db.storage.from(BUCKET);

  async function getJson<T>(p: string): Promise<T | null> {
    const { data, error } = await bucket().download(p);
    if (error || !data) return null;
    try {
      return JSON.parse(await data.text()) as T;
    } catch {
      return null;
    }
  }
  async function putJson(p: string, v: unknown) {
    const { error } = await bucket().upload(p, new Blob([JSON.stringify(v)], { type: "application/json" }),
      { upsert: true, cacheControl: "0", contentType: "application/json" });
    if (error) throw new Error(error.message);
  }
  const recPath = (id: string) => `${META}/requests/${id}.json`;
  const loadRec = (id: string) => (/^[0-9a-f-]{36}$/i.test(id) ? getJson<Rec>(recPath(id)) : Promise.resolve(null));
  const strip = (r: Rec): VkmRequest => {
    const { files: _files, ...rest } = r; // eslint-disable-line @typescript-eslint/no-unused-vars
    return rest;
  };
  async function syncInbox(r: Rec) {
    const marker = `${META}/inbox/${r.id}.json`;
    if (r.status === "submitted" && !r.synced_at) await putJson(marker, { id: r.id });
    else await bucket().remove([marker]);
  }
  // file ids carry their request id so a file can be found from its id alone
  const reqOfFile = (fileId: string) => fileId.split(".")[0];

  return {
    async insertRequest(r) {
      const rec: Rec = {
        ...r, id: crypto.randomUUID(), created_at: new Date().toISOString(), failed_attempts: 0,
        status: "open", submitted_at: null, client_services: [], client_message: null, client_contact: {},
        synced_at: null, files: [],
      };
      await putJson(recPath(rec.id), rec);
      await putJson(`${META}/tokens/${rec.token_hash}.json`, { id: rec.id });
      await putJson(`${META}/codes/${rec.client_code.toUpperCase()}.json`, { id: rec.id });
      return strip(rec);
    },
    async findRequest(by) {
      let id = by.id;
      if (!id && by.token_hash) id = (await getJson<{ id: string }>(`${META}/tokens/${by.token_hash}.json`))?.id;
      if (!id && by.client_code) {
        id = (await getJson<{ id: string }>(`${META}/codes/${by.client_code.toUpperCase()}.json`))?.id;
      }
      const rec = id ? await loadRec(id) : null;
      return rec ? strip(rec) : null;
    },
    async updateRequest(id, patch) {
      const rec = await loadRec(id);
      if (!rec) throw new Error("request not found");
      const next = { ...rec, ...patch, id: rec.id } as Rec;
      await putJson(recPath(id), next);
      if ("status" in patch || "synced_at" in patch) await syncInbox(next);
    },
    async listRequests(f) {
      let ids = f.ids ?? [];
      if (f.submittedUnsynced) {
        const { data } = await bucket().list(`${META}/inbox`, { limit: 1000 });
        ids = (data ?? []).map((o) => o.name.replace(/\.json$/, ""));
      }
      const recs = await Promise.all(ids.slice(0, 200).map(loadRec));
      return recs.filter((r): r is Rec => Boolean(r))
        .filter((r) => !f.submittedUnsynced || (r.status === "submitted" && !r.synced_at))
        .sort((a, b) => a.created_at.localeCompare(b.created_at)).map(strip);
    },
    async insertFile(f) {
      const rec = await loadRec(f.request_id);
      if (!rec) throw new Error("request not found");
      const file: VkmFile = {
        ...f, id: `${rec.id}.${crypto.randomUUID()}`, uploaded_at: new Date().toISOString(), synced_at: null, confirmed: false,
      };
      rec.files = [...(rec.files || []), file];
      await putJson(recPath(rec.id), rec);
      return file;
    },
    async listFiles(requestId) {
      return (await loadRec(requestId))?.files ?? [];
    },
    async updateFile(id, patch) {
      const rec = await loadRec(reqOfFile(id));
      if (!rec) return;
      rec.files = rec.files.map((x) => (x.id === id ? { ...x, ...patch, id } : x));
      await putJson(recPath(rec.id), rec);
    },
    async deleteFiles(ids) {
      const byReq = new Map<string, Set<string>>();
      ids.forEach((i) => byReq.set(reqOfFile(i), (byReq.get(reqOfFile(i)) ?? new Set()).add(i)));
      for (const [rid, drop] of byReq) {
        const rec = await loadRec(rid);
        if (!rec) continue;
        rec.files = rec.files.filter((x) => !drop.has(x.id));
        await putJson(recPath(rid), rec);
      }
    },
    async addEvent(requestId, event, ip, ua) {
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      await putJson(`${META}/events/${requestId ?? "none"}/${stamp}-${crypto.randomBytes(3).toString("hex")}.json`,
        { event, ip, ua: ua.slice(0, 300), at: new Date().toISOString() }).catch(() => undefined);
    },
    async signedUpload(objectPath, mime) {
      const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(objectPath);
      if (error || !data) return null;
      const headers: Record<string, string> = { "content-type": mime || "application/octet-stream", "x-upsert": "false" };
      if (anon) {
        headers.apikey = anon;
        headers.authorization = `Bearer ${anon}`;
      }
      return { url: data.signedUrl, headers };
    },
    async objectExists(objectPath) {
      const { data } = await db.storage.from(BUCKET).exists(objectPath);
      return Boolean(data);
    },
    async signedDownload(objectPath, seconds) {
      const { data } = await db.storage.from(BUCKET).createSignedUrl(objectPath, seconds);
      return data?.signedUrl ?? null;
    },
    async removeObjects(paths) {
      if (paths.length) await db.storage.from(BUCKET).remove(paths);
    },
  };
}

// ── Local file store (next dev + VKM_DEV_STORE=1 only) ──────────────────────
const DEV_DIR = path.join(process.cwd(), ".vkm-dev");
type DevDb = { requests: VkmRequest[]; files: VkmFile[]; events: unknown[] };

export function devStoreEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.VKM_DEV_STORE === "1";
}

async function devLoad(): Promise<DevDb> {
  try {
    return JSON.parse(await fs.readFile(path.join(DEV_DIR, "db.json"), "utf8"));
  } catch {
    return { requests: [], files: [], events: [] };
  }
}
async function devSave(d: DevDb) {
  await fs.mkdir(DEV_DIR, { recursive: true });
  await fs.writeFile(path.join(DEV_DIR, "db.json"), JSON.stringify(d, null, 1));
}
export function devObjectFile(objectPath: string) {
  const full = path.resolve(DEV_DIR, "files", objectPath);
  if (!full.startsWith(path.resolve(DEV_DIR, "files"))) throw new Error("bad path");
  return full;
}
export function devSign(objectPath: string, kind: string, exp: number) {
  return crypto.createHmac("sha256", secretKey()).update(`${kind}:${objectPath}:${exp}`).digest("hex");
}

function devStore(): Store {
  const base = process.env.VKM_DEV_BASE_URL || "http://localhost:3000";
  const signed = (kind: string, p: string, seconds: number) => {
    const exp = Date.now() + seconds * 1000;
    return `${base}/api/vkm/dev-files?kind=${kind}&path=${encodeURIComponent(p)}&exp=${exp}&sig=${devSign(p, kind, exp)}`;
  };
  return {
    async insertRequest(r) {
      const d = await devLoad();
      const row: VkmRequest = {
        ...r, id: crypto.randomUUID(), created_at: new Date().toISOString(), failed_attempts: 0,
        status: "open", submitted_at: null, client_services: [], client_message: null, client_contact: {}, synced_at: null,
      };
      d.requests.push(row);
      await devSave(d);
      return row;
    },
    async findRequest(by) {
      const d = await devLoad();
      const rows = d.requests.filter((r) =>
        by.id ? r.id === by.id : by.token_hash ? r.token_hash === by.token_hash
          : by.client_code ? r.client_code.toUpperCase() === by.client_code.toUpperCase() : false);
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return rows[0] ?? null;
    },
    async updateRequest(id, patch) {
      const d = await devLoad();
      d.requests = d.requests.map((r) => (r.id === id ? { ...r, ...patch } : r));
      await devSave(d);
    },
    async listRequests(f) {
      const d = await devLoad();
      return d.requests.filter((r) =>
        (!f.submittedUnsynced || (r.status === "submitted" && !r.synced_at)) && (!f.ids || f.ids.includes(r.id)));
    },
    async insertFile(f) {
      const d = await devLoad();
      const row: VkmFile = { ...f, id: crypto.randomUUID(), uploaded_at: new Date().toISOString(), synced_at: null, confirmed: false };
      d.files.push(row);
      await devSave(d);
      return row;
    },
    async listFiles(requestId) {
      return (await devLoad()).files.filter((f) => f.request_id === requestId);
    },
    async updateFile(id, patch) {
      const d = await devLoad();
      d.files = d.files.map((f) => (f.id === id ? { ...f, ...patch } : f));
      await devSave(d);
    },
    async deleteFiles(ids) {
      const d = await devLoad();
      d.files = d.files.filter((f) => !ids.includes(f.id));
      await devSave(d);
    },
    async addEvent(requestId, event, ip, ua) {
      const d = await devLoad();
      d.events.push({ request_id: requestId, event, ip, ua, created_at: new Date().toISOString() });
      await devSave(d);
    },
    async signedUpload(objectPath, mime) {
      return { url: signed("put", objectPath, 7200), headers: { "content-type": mime || "application/octet-stream" } };
    },
    async objectExists(objectPath) {
      return fs.stat(devObjectFile(objectPath)).then(() => true, () => false);
    },
    async signedDownload(objectPath, seconds) {
      return signed("get", objectPath, seconds);
    },
    async removeObjects(paths) {
      await Promise.all(paths.map((p) => fs.rm(devObjectFile(p), { force: true })));
    },
  };
}

export function getStore(): Store | null {
  if (devStoreEnabled()) return devStore();
  return supabaseStore();
}

// ── secrets, tokens, PINs ───────────────────────────────────────────────────
function secretKey(): string {
  // a dedicated secret if set; otherwise derived from the service-role key,
  // which only the server has
  const s = process.env.VKM_PORTAL_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY ||
    (devStoreEnabled() ? "vkm-dev-only-secret" : "");
  if (!s) throw new Error("VKM portal secret is not configured");
  return crypto.createHash("sha256").update("vkm-portal:" + s).digest("hex");
}

export function newToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
export function looksLikeToken(t: string): boolean {
  return /^[A-Za-z0-9_-]{32}$/.test(t);
}
export function newPin(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}
export function hashPin(pin: string, salt?: string) {
  const s = salt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(pin + ":" + secretKey(), s, 32).toString("hex");
  return { hash, salt: s };
}
export function pinMatches(pin: string, r: VkmRequest): boolean {
  if (!/^\d{6}$/.test(pin)) return false;
  const a = Buffer.from(hashPin(pin, r.pin_salt).hash, "hex");
  const b = Buffer.from(r.pin_hash, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── session cookie (after a correct PIN) ────────────────────────────────────
function signSession(id: string, exp: number) {
  return crypto.createHmac("sha256", secretKey()).update(`session:${id}:${exp}`).digest("hex");
}
export async function startSession(id: string) {
  const exp = Date.now() + SESSION_MINUTES * 60_000;
  const store = await cookies();
  store.set(SESSION_COOKIE, `${id}.${exp}.${signSession(id, exp)}`, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict",
    path: "/", maxAge: SESSION_MINUTES * 60,
  });
}
export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
export async function sessionRequestId(): Promise<string | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value || "";
  const [id, expS, sig] = raw.split(".");
  const exp = Number(expS);
  if (!id || !sig || !exp || exp < Date.now()) return null;
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(signSession(id, exp), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? id : null;
}

// ── helpers ─────────────────────────────────────────────────────────────────
export function clientIp(req: Request): string {
  return (req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for")?.split(",")[0] || "").trim();
}
export function userAgent(req: Request): string {
  return req.headers.get("user-agent") || "";
}

// Best-effort per-IP limiter (per server instance). The real brute-force
// protection is the per-request PIN lockout stored in the database.
const hits = new Map<string, number[]>();
export function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

export function effectiveStatus(r: VkmRequest): RequestStatus | "expired" {
  if (r.status === "open" && Date.parse(r.expires_at) < Date.now()) return "expired";
  return r.status;
}

export function officeAuthorized(req: Request): boolean {
  const secret = process.env.CRM_SYNC_TOKEN;
  if (!secret) return false;
  const a = Buffer.from(req.headers.get("authorization") || "");
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function siteBase(req: Request): string {
  if (devStoreEnabled()) return process.env.VKM_DEV_BASE_URL || new URL(req.url).origin;
  return process.env.NEXT_PUBLIC_SITE_URL || "https://cmavkmunje.com";
}

export function safeFileName(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|\x00-\x1f]/g, "_").trim().slice(0, 150);
  return cleaned || "document";
}

// The request behind the current session cookie, if it may still be used.
export async function sessionRequest(): Promise<
  { ok: true; store: Store; r: VkmRequest } | { ok: false; res: Response }> {
  const store = getStore();
  if (!store) return { ok: false, res: noStore({ error: "Service not configured" }, { status: 503 }) };
  const id = await sessionRequestId();
  if (!id) return { ok: false, res: noStore({ error: "Your session has ended. Please open the link and enter your PIN again." }, { status: 401 }) };
  const r = await store.findRequest({ id });
  if (!r) return { ok: false, res: noStore({ error: "Request not found" }, { status: 404 }) };
  const st = effectiveStatus(r);
  if (st !== "open") {
    await endSession();
    return { ok: false, res: noStore({ error: closedMessage(st), status: st }, { status: 403 }) };
  }
  return { ok: true, store, r };
}

export function closedMessage(st: RequestStatus | "expired"): string {
  switch (st) {
    case "submitted": return "Your documents have already been submitted. For any change, please contact V K Munje & Company — we will re-open access for you.";
    case "locked": return "This request is locked after too many wrong PIN attempts. Please contact V K Munje & Company to unlock it.";
    case "revoked": return "This link has been cancelled. Please contact V K Munje & Company for a new link.";
    case "expired": return "This link has expired. Please contact V K Munje & Company for a fresh link.";
    default: return "";
  }
}

export function noStore(body: unknown, init: { status?: number } = {}) {
  return Response.json(body, {
    status: init.status ?? 200,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
