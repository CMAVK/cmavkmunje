import { getStore, intakeStatus, noStore, officeAuthorized } from "@/lib/vkmRequests";

// Office actions on an intake link: revoke (cancel for good) or unlock
// (after too many wrong PINs).
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!officeAuthorized(req)) return noStore({ error: "unauthorized" }, { status: 401 });
  const store = getStore();
  if (!store) return noStore({ error: "not configured" }, { status: 503 });
  const { id } = await ctx.params;
  const i = await store.findIntake({ id });
  if (!i) return noStore({ error: "not found" }, { status: 404 });
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };
  if (action === "revoke") {
    await store.updateIntake(id, { status: "revoked" });
    return noStore({ ok: true, status: "revoked" });
  }
  if (action === "unlock") {
    if (i.status === "revoked") return noStore({ error: "This link was cancelled — create a new one." }, { status: 409 });
    await store.updateIntake(id, { status: "open", failed_attempts: 0 });
    return noStore({ ok: true, status: intakeStatus({ ...i, status: "open" }) });
  }
  return noStore({ error: "unknown action" }, { status: 400 });
}
