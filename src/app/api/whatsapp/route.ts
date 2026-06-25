import { NextResponse } from "next/server";
import { callClaude, type ChatMessage } from "@/lib/vkmBrain";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// ============================================================
//  WhatsApp Business (Meta Cloud API) webhook for VKM AI.
//
//  GET  → webhook verification handshake (Meta calls this once
//         when you subscribe the webhook in the App dashboard).
//  POST → incoming messages. We load the recent conversation for
//         that number, ask Claude (shared VKM AI brain), reply via
//         the Graph API, and store both sides. A lead is captured
//         in the `leads` table on the contact's first message.
//
//  Required env vars (see WHATSAPP-SETUP.md):
//    WHATSAPP_VERIFY_TOKEN   — any secret string you choose
//    WHATSAPP_TOKEN          — permanent access token
//    WHATSAPP_PHONE_NUMBER_ID— the number's Phone Number ID
//    ANTHROPIC_API_KEY       — already used by the website chat
//  Optional:
//    WHATSAPP_GRAPH_VERSION  — defaults to v21.0
// ============================================================

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";

// ── GET: verification handshake ──────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    // Meta expects the raw challenge string echoed back with 200.
    return new Response(challenge ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

// ── POST: incoming message events ────────────────────────────
export async function POST(req: Request) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  let payload: WhatsAppWebhook;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Always acknowledge fast; Meta retries on non-200. We process inline
  // (Haiku is quick) and still return 200 at the end. Any error is logged
  // but we avoid 5xx so Meta does not flood us with retries.
  try {
    const value = payload?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];

    // Status callbacks (delivered/read) and non-message events: ignore.
    if (!message || message.type === undefined) {
      return NextResponse.json({ ok: true });
    }

    const from = message.from; // sender's WhatsApp number (E.164, no +)
    const waMessageId = message.id;
    const profileName = value?.contacts?.[0]?.profile?.name ?? null;
    const text = extractText(message);

    if (!from || !waMessageId) {
      return NextResponse.json({ ok: true });
    }

    if (!token || !phoneNumberId) {
      console.error("[whatsapp] missing WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID");
      return NextResponse.json({ ok: true });
    }

    const db = getSupabaseAdmin();

    // Dedupe: Meta re-delivers if we are slow. Skip already-seen messages.
    if (db && (await alreadyHandled(db, waMessageId))) {
      return NextResponse.json({ ok: true });
    }

    // Non-text messages (images, docs, audio): acknowledge politely.
    if (!text) {
      await sendWhatsApp(
        phoneNumberId,
        token,
        from,
        "Thank you. I've noted your message. For documents, our team will review and get back to you — you can also share details in text and I'll guide you right away."
      );
      if (db) {
        await recordMessage(db, from, "assistant", "[acknowledged non-text message]", null);
      }
      return NextResponse.json({ ok: true });
    }

    // Build context from recent history (if DB available).
    const history = db ? await loadHistory(db, from) : [];
    const isFirstContact = history.length === 0;
    const messages: ChatMessage[] = [...history, { role: "user", content: text }];

    let reply: string | null;
    try {
      reply = await callClaude(messages, { channel: "whatsapp", maxTokens: 600 });
    } catch (err) {
      console.error("[whatsapp] Claude error:", err);
      reply = null;
    }

    const finalReply =
      reply ??
      `Thank you for messaging V K Munje & Company. Our team will assist you shortly. For urgent help, please call +91 9922099970 or email cma.vickymunje@gmail.com.`;

    await sendWhatsApp(phoneNumberId, token, from, finalReply);

    // Persist conversation + capture a lead on first contact.
    if (db) {
      await recordMessage(db, from, "user", text, waMessageId);
      await recordMessage(db, from, "assistant", finalReply, null);
      if (isFirstContact) {
        await db.from("leads").insert({
          source: "whatsapp",
          name: profileName,
          phone: from,
          message: `First WhatsApp message: ${text}`.slice(0, 1000),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp] handler error:", err);
    // Still 200 so Meta does not retry a poisoned event repeatedly.
    return NextResponse.json({ ok: true });
  }
}

// ── Helpers ──────────────────────────────────────────────────

function extractText(message: WhatsAppMessage): string {
  if (message.type === "text") return message.text?.body?.trim() ?? "";
  // Interactive replies (buttons / list) carry their title.
  if (message.type === "interactive") {
    return (
      message.interactive?.button_reply?.title ??
      message.interactive?.list_reply?.title ??
      ""
    ).trim();
  }
  if (message.type === "button") return message.button?.text?.trim() ?? "";
  return "";
}

async function sendWhatsApp(
  phoneNumberId: string,
  token: string,
  to: string,
  body: string
): Promise<void> {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { preview_url: false, body: body.slice(0, 4096) },
      }),
    }
  );
  if (!res.ok) {
    console.error("[whatsapp] send failed:", res.status, (await res.text()).slice(0, 300));
  }
}

// Minimal typed shape of the Supabase client we use here.
type Db = NonNullable<ReturnType<typeof getSupabaseAdmin>>;

async function alreadyHandled(db: Db, waMessageId: string): Promise<boolean> {
  const { data } = await db
    .from("whatsapp_messages")
    .select("id")
    .eq("wa_message_id", waMessageId)
    .limit(1);
  return Array.isArray(data) && data.length > 0;
}

async function loadHistory(db: Db, phone: string): Promise<ChatMessage[]> {
  const { data } = await db
    .from("whatsapp_messages")
    .select("role, content, created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(12);
  if (!Array.isArray(data)) return [];
  return data
    .reverse()
    .map((r) => ({ role: r.role as "user" | "assistant", content: r.content as string }));
}

async function recordMessage(
  db: Db,
  phone: string,
  role: "user" | "assistant",
  content: string,
  waMessageId: string | null
): Promise<void> {
  await db
    .from("whatsapp_messages")
    .insert({ phone, role, content, wa_message_id: waMessageId });
}

// ── Meta webhook payload types (only the fields we read) ─────
type WhatsAppMessage = {
  id: string;
  from: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: {
    button_reply?: { title?: string };
    list_reply?: { title?: string };
  };
};

type WhatsAppWebhook = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { profile?: { name?: string } }[];
        messages?: WhatsAppMessage[];
      };
    }[];
  }[];
};
