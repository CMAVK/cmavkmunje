import {
  clientIp, getStore, hashToken, intakeStatus, looksLikeToken, noStore, rateLimited,
} from "@/lib/vkmRequests";

const CLOSED: Record<string, string> = {
  revoked: "This link has been cancelled. Please contact V K Munje & Company.",
  expired: "This link has expired. Please contact V K Munje & Company for a fresh link.",
  locked: "This link is locked after too many wrong PIN attempts. Please contact V K Munje & Company.",
  full: "This link is no longer accepting submissions. Please contact V K Munje & Company.",
};

// A visitor opens /vkm/i/<token>: is the link usable, and does it need a PIN?
export async function POST(req: Request) {
  if (rateLimited("iopen:" + clientIp(req), 30, 10 * 60_000)) {
    return noStore({ error: "Too many attempts. Please wait a few minutes." }, { status: 429 });
  }
  const store = getStore();
  if (!store) return noStore({ error: "Service not configured" }, { status: 503 });
  const { token } = (await req.json().catch(() => ({}))) as { token?: string };
  if (!token || !looksLikeToken(token)) return noStore({ error: "This link is not valid." }, { status: 404 });
  const i = await store.findIntake({ token_hash: hashToken(token) });
  if (!i) return noStore({ error: "This link is not valid." }, { status: 404 });
  const st = intakeStatus(i);
  return noStore({
    status: st, message: CLOSED[st] ?? "", title: i.title, services: i.services, needs_pin: Boolean(i.pin_hash),
  });
}
