import { effectiveStatus, getStore, hashPin, newPin, noStore, officeAuthorized } from "@/lib/vkmRequests";

// Office actions on one request:
//   revoke  - cancel the link for good
//   reopen  - give the client access again (after submit / lock / expiry); new PIN
//   new_pin - replace the PIN (e.g. the client lost it); request stays as it is
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const { id } = await ctx.params;
  const r = await store.findRequest({ id });
  if (!r) return noStore({ error: "not found" }, { status: 404 });

  const b = (await req.json().catch(() => ({}))) as { action?: string; days?: number };
  const days = Math.max(1, Math.min(Number(b.days) || 7, 60));

  if (b.action === "revoke") {
    await store.updateRequest(id, { status: "revoked" });
    await store.addEvent(id, "revoked", "office", "");
    // nothing more will be collected; drop files that were never submitted
    if (!(r.status === "submitted" && !r.synced_at)) {
      const files = await store.listFiles(id);
      await store.removeObjects(files.map((f) => f.storage_path));
      await store.deleteFiles(files.map((f) => f.id));
    }
    return noStore({ ok: true, status: "revoked" });
  }

  if (b.action === "reopen" || b.action === "new_pin") {
    if (r.status === "revoked") return noStore({ error: "This link was cancelled — create a new one." }, { status: 409 });
    if (r.status === "submitted" && !r.synced_at) {
      return noStore({ error: "The client's last submission has not reached the office yet — sync first." }, { status: 409 });
    }
    const pin = newPin();
    const { hash, salt } = hashPin(pin);
    const patch: Record<string, unknown> = { pin_hash: hash, pin_salt: salt, failed_attempts: 0 };
    if (b.action === "reopen") {
      patch.status = "open";
      const until = Date.now() + days * 86400_000;
      if (Date.parse(r.expires_at) < until) patch.expires_at = new Date(until).toISOString();
    } else if (r.status === "locked") {
      patch.status = "open";
    }
    await store.updateRequest(id, patch);
    await store.addEvent(id, b.action, "office", "");
    const fresh = await store.findRequest({ id });
    return noStore({ ok: true, pin, status: fresh ? effectiveStatus(fresh) : "open", expires_at: fresh?.expires_at });
  }

  return noStore({ error: "unknown action" }, { status: 400 });
}
