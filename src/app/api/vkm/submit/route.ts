import { clientIp, endSession, noStore, sessionRequest, userAgent } from "@/lib/vkmRequests";

// Final step. After this the link is closed: opening it again only shows
// "already submitted" until the firm re-opens access.
export async function POST(req: Request) {
  const s = await sessionRequest();
  if (!s.ok) return s.res;
  const { store, r } = s;
  const body = (await req.json().catch(() => ({}))) as {
    services?: string[]; message?: string; phone?: string; email?: string;
  };
  const files = await store.listFiles(r.id);
  const confirmed = files.filter((f) => f.confirmed);
  const services = (Array.isArray(body.services) ? body.services : [])
    .map(String).filter((x) => r.services.includes(x));
  const message = String(body.message || "").trim().slice(0, 2000);
  if (!confirmed.length && !services.length && !message) {
    return noStore({ error: "Please upload at least one document, or tell us which service you need." }, { status: 400 });
  }
  const contact: Record<string, string> = {};
  const phone = String(body.phone || "").replace(/[^\d+ ]/g, "").trim().slice(0, 20);
  const email = String(body.email || "").trim().slice(0, 120);
  if (phone) contact.phone = phone;
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) contact.email = email;

  // unfinished uploads never reach the office
  const unfinished = files.filter((f) => !f.confirmed);
  if (unfinished.length) {
    await store.removeObjects(unfinished.map((f) => f.storage_path));
    await store.deleteFiles(unfinished.map((f) => f.id));
  }
  await store.updateRequest(r.id, {
    status: "submitted", submitted_at: new Date().toISOString(), synced_at: null,
    client_services: services, client_message: message || null, client_contact: contact,
  });
  await store.addEvent(r.id, "submit", clientIp(req), userAgent(req));
  await endSession();
  return noStore({ ok: true, files: confirmed.length });
}
