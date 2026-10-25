import {
  getStore, hashPin, hashToken, intakeStatus, newPin, newToken, noStore, officeAuthorized, siteBase,
} from "@/lib/vkmRequests";

// Office (VKM SmartDocs): general intake links for Link Intake.

// Create one. The link token (and PIN, if asked for) are returned ONCE.
export async function POST(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as {
    title?: string; services?: string[]; days?: number; with_pin?: boolean; max_submissions?: number; created_by?: string;
  };
  const days = Math.max(1, Math.min(Number(b.days) || 30, 365));
  const services = (Array.isArray(b.services) ? b.services : []).map((s) => String(s).trim().slice(0, 80))
    .filter(Boolean).slice(0, 30);
  const token = newToken();
  const pin = b.with_pin ? newPin() : null;
  const hp = pin ? hashPin(pin) : null;
  const i = await store.insertIntake({
    token_hash: hashToken(token), title: String(b.title || "Document Submission").trim().slice(0, 120) || "Document Submission",
    services, pin_hash: hp?.hash ?? null, pin_salt: hp?.salt ?? null,
    expires_at: new Date(Date.now() + days * 86400_000).toISOString(),
    max_submissions: Math.max(1, Math.min(Number(b.max_submissions) || 200, 2000)),
    created_by: String(b.created_by || "").slice(0, 50) || null,
  });
  return noStore({ id: i.id, url: `${siteBase(req)}/vkm/i/${token}`, pin, expires_at: i.expires_at }, { status: 201 });
}

// Current state of the given intake links (?ids=a,b).
export async function GET(req: Request) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const ids = (new URL(req.url).searchParams.get("ids") || "").split(",")
    .map((s) => s.trim()).filter((s) => /^[0-9a-f-]{36}$/i.test(s)).slice(0, 200);
  const rows = await store.listIntakes(ids);
  return noStore({
    intakes: rows.map((i) => ({
      id: i.id, status: intakeStatus(i), submissions: i.submissions, max_submissions: i.max_submissions, expires_at: i.expires_at,
    })),
  });
}
