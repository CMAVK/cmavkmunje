import {
  clientIp, closedMessage, effectiveStatus, getStore, hashToken, looksLikeToken,
  noStore, rateLimited, userAgent,
} from "@/lib/vkmRequests";

// First step when a client opens /vkm/<token>: is the link usable, and whose
// is it? Only the first name is shown until the PIN is entered.
export async function POST(req: Request) {
  const ip = clientIp(req);
  if (rateLimited("open:" + ip, 30, 10 * 60_000)) {
    return noStore({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const store = getStore();
  if (!store) return noStore({ error: "Service not configured" }, { status: 503 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token || !looksLikeToken(token)) return noStore({ error: "This link is not valid." }, { status: 404 });

  const r = await store.findRequest({ token_hash: hashToken(token) });
  if (!r) return noStore({ error: "This link is not valid." }, { status: 404 });
  await store.addEvent(r.id, "open", ip, userAgent(req));

  const st = effectiveStatus(r);
  return noStore({
    status: st,
    message: st === "open" ? "" : closedMessage(st),
    title: r.title,
    first_name: r.client_name.split(/\s+/)[0] || "",
    expires_at: r.expires_at,
  });
}
