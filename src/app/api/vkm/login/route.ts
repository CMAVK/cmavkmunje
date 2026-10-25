import {
  MAX_PIN_ATTEMPTS, clientIp, closedMessage, effectiveStatus, getStore, hashToken,
  looksLikeToken, noStore, pinMatches, rateLimited, startSession, userAgent,
} from "@/lib/vkmRequests";

// PIN check. Two ways in: the link token + PIN, or "Client login" with the
// client code (e.g. VKM1004) + PIN. Wrong PINs count against the request and
// lock it after MAX_PIN_ATTEMPTS.
export async function POST(req: Request) {
  const ip = clientIp(req);
  const ua = userAgent(req);
  if (rateLimited("login:" + ip, 15, 15 * 60_000)) {
    return noStore({ error: "Too many attempts. Please wait 15 minutes and try again." }, { status: 429 });
  }
  const store = getStore();
  if (!store) return noStore({ error: "Service not configured" }, { status: 503 });

  const body = (await req.json().catch(() => ({}))) as { token?: string; client_code?: string; pin?: string };
  const pin = String(body.pin || "").trim();
  let r = null;
  if (body.token) {
    if (!looksLikeToken(body.token)) return noStore({ error: "This link is not valid." }, { status: 404 });
    r = await store.findRequest({ token_hash: hashToken(body.token) });
  } else if (body.client_code) {
    const code = String(body.client_code).trim().toUpperCase();
    if (!/^[A-Z0-9-]{3,20}$/.test(code)) return noStore({ error: "Client ID or PIN is incorrect." }, { status: 401 });
    r = await store.findRequest({ client_code: code });
    if (r?.intake_id) r = null; // one-off intake requests have no client login
  }
  // same answer for "no such client" and "wrong PIN" on client login
  if (!r) return noStore({ error: body.token ? "This link is not valid." : "Client ID or PIN is incorrect." },
    { status: body.token ? 404 : 401 });

  const st = effectiveStatus(r);
  if (st !== "open") return noStore({ error: closedMessage(st), status: st }, { status: 403 });

  if (!pinMatches(pin, r)) {
    const attempts = r.failed_attempts + 1;
    const locked = attempts >= MAX_PIN_ATTEMPTS;
    await store.updateRequest(r.id, { failed_attempts: attempts, ...(locked ? { status: "locked" as const } : {}) });
    await store.addEvent(r.id, locked ? "locked" : "pin_wrong", ip, ua);
    if (locked) return noStore({ error: closedMessage("locked"), status: "locked" }, { status: 403 });
    const left = MAX_PIN_ATTEMPTS - attempts;
    return noStore({
      error: body.token
        ? `Incorrect PIN. ${left} attempt${left === 1 ? "" : "s"} left before the link is locked.`
        : "Client ID or PIN is incorrect.",
    }, { status: 401 });
  }

  if (r.failed_attempts) await store.updateRequest(r.id, { failed_attempts: 0 });
  await store.addEvent(r.id, "login", ip, ua);
  await startSession(r.id);
  return noStore({ ok: true });
}
