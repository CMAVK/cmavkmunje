import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { site } from "@/lib/site";

// Daily practice digest — run by Vercel Cron every evening (see vercel.json).
// Collects the last 24h of leads and document uploads plus pending reviews,
// and emails a summary to the firm via Formspree. Sends nothing on quiet
// days (unless ?force=<key> is used for testing) to conserve the Formspree
// free-tier quota.
const FORCE_KEY = "vkm-summary-3f8a12";

type Lead = { name: string | null; phone: string | null; service: string | null; source: string };
type Doc = { client_name: string; phone: string | null; file_name: string; category: string };

export async function GET(req: Request) {
  const force = new URL(req.url).searchParams.get("force") === FORCE_KEY;

  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ ok: false, reason: "not configured" }, { status: 500 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [leadsRes, docsRes, reviewsRes] = await Promise.all([
    db.from("leads").select("name,phone,service,source").gte("created_at", since).order("created_at", { ascending: false }),
    db.from("documents").select("client_name,phone,file_name,category").gte("created_at", since).order("created_at", { ascending: false }),
    db.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  const err = leadsRes.error || docsRes.error || reviewsRes.error;
  if (err) return NextResponse.json({ ok: false, reason: err.message }, { status: 502 });

  const leads = (leadsRes.data ?? []) as Lead[];
  const docs = (docsRes.data ?? []) as Doc[];
  const pendingReviews = reviewsRes.count ?? 0;

  if (leads.length === 0 && docs.length === 0 && pendingReviews === 0 && !force) {
    return NextResponse.json({ ok: true, sent: false, reason: "no activity today" });
  }

  const leadLines = leads
    .map((l) => `• ${l.name || "Unknown"} — ${l.phone || "no number"} — ${l.service || "service not stated"} (${l.source})`)
    .join("\n");
  const docLines = docs
    .map((d) => `• ${d.client_name} — ${d.file_name} (${d.category})${d.phone ? " — " + d.phone : ""}`)
    .join("\n");

  const body = [
    `VKM DAILY PRACTICE SUMMARY — last 24 hours`,
    ``,
    `NEW LEADS: ${leads.length}`,
    leads.length ? leadLines : `(none)`,
    ``,
    `DOCUMENTS RECEIVED: ${docs.length}`,
    docs.length ? docLines : `(none)`,
    ``,
    `REVIEWS AWAITING APPROVAL: ${pendingReviews}`,
    ``,
    `Act on these in the admin panel: ${site.url}/admin`,
  ].join("\n");

  const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;
  if (!FORMSPREE) return NextResponse.json({ ok: false, reason: "Formspree not configured" }, { status: 500 });

  const send = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      _subject: `📊 VKM Daily Summary — ${leads.length} lead(s), ${docs.length} document(s), ${pendingReviews} review(s) pending`,
      summary: body,
    }),
  });

  if (!send.ok) {
    return NextResponse.json({ ok: false, reason: `Formspree ${send.status}` }, { status: 502 });
  }
  return NextResponse.json({ ok: true, sent: true, leads: leads.length, documents: docs.length, pendingReviews });
}
