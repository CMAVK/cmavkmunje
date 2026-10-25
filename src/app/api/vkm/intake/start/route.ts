import crypto from "crypto";
import {
  clientIp, getStore, hashPin, hashToken, intakePinMatches, intakeStatus, looksLikeToken, noStore,
  rateLimited, startSession, userAgent,
} from "@/lib/vkmRequests";

const MAX_INTAKE_PIN_ATTEMPTS = 10;

// A visitor on a general intake link enters their details (and the PIN if the
// link has one). They get their OWN private request and a session for it;
// from here the normal upload / submit flow applies, and after submitting
// that request is closed.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const ua = userAgent(req);
  if (rateLimited("istart:" + ip, 8, 60 * 60_000)) {
    return noStore({ error: "Too many submissions from this device. Please try again later." }, { status: 429 });
  }
  const store = getStore();
  if (!store) return noStore({ error: "Service not configured" }, { status: 503 });

  const b = (await req.json().catch(() => ({}))) as {
    token?: string; pin?: string; name?: string; phone?: string; email?: string; service?: string;
  };
  if (!b.token || !looksLikeToken(b.token)) return noStore({ error: "This link is not valid." }, { status: 404 });
  const i = await store.findIntake({ token_hash: hashToken(b.token) });
  if (!i) return noStore({ error: "This link is not valid." }, { status: 404 });
  if (intakeStatus(i) !== "open") return noStore({ error: "This link can no longer be used.", status: intakeStatus(i) }, { status: 403 });

  if (!intakePinMatches(String(b.pin || "").trim(), i)) {
    const attempts = i.failed_attempts + 1;
    const locked = attempts >= MAX_INTAKE_PIN_ATTEMPTS;
    await store.updateIntake(i.id, { failed_attempts: attempts, ...(locked ? { status: "locked" as const } : {}) });
    await store.addEvent(null, `intake_pin_wrong:${i.id}`, ip, ua);
    return noStore({ error: locked ? "This link is now locked. Please contact V K Munje & Company." : "Incorrect PIN." },
      { status: locked ? 403 : 401 });
  }

  const name = String(b.name || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const phone = String(b.phone || "").replace(/[^\d+]/g, "").slice(0, 15);
  const email = String(b.email || "").trim().slice(0, 120);
  if (name.length < 3) return noStore({ error: "Please enter your full name." }, { status: 400 });
  if (phone.replace(/\D/g, "").length < 10) return noStore({ error: "Please enter a valid mobile number." }, { status: 400 });
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return noStore({ error: "Please check your email address." }, { status: 400 });
  const service = i.services.includes(String(b.service || "")) ? String(b.service) : "";

  // the child request has no usable link or PIN of its own: only this session opens it
  const ghost = crypto.randomBytes(24).toString("base64url");
  const hp = hashPin(crypto.randomBytes(8).toString("hex"));
  const r = await store.insertRequest({
    token_hash: hashToken(ghost), client_code: `NEW-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
    client_name: name, title: i.title, documents: [], services: i.services, pin_hash: hp.hash, pin_salt: hp.salt,
    max_files: 25, expires_at: new Date(Date.now() + 86400_000).toISOString(), created_by: "intake",
    intake_id: i.id,
  });
  const contact: Record<string, string> = { phone };
  if (email) contact.email = email;
  await store.updateRequest(r.id, { client_contact: contact, client_services: service ? [service] : [] });
  await store.updateIntake(i.id, { submissions: i.submissions + 1, failed_attempts: 0 });
  await store.addEvent(r.id, "intake_start", ip, ua);
  await startSession(r.id);
  return noStore({ ok: true });
}
