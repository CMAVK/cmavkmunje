import { NextResponse } from "next/server";
import { callClaude, type ChatMessage } from "@/lib/vkmBrain";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  sendText,
  sendDocument,
  sendMainMenu,
  sendChecklistMenu,
  bookingMessage,
  humanHandoffMessage,
  isGreetingOrMenu,
  checklistLink,
  CHECKLISTS,
  SERVICE_PROMPTS,
} from "@/lib/whatsapp";

// ============================================================
//  WhatsApp Business (Meta Cloud API) webhook for VKM AI.
//
//  GET  → webhook verification handshake.
//  POST → incoming messages. Flow:
//          • tapped menu option   → handle the action (menu / checklist
//            PDF / booking / human handoff / service intro via AI)
//          • greeting ("hi"/"menu")→ send the interactive main menu
//          • any other text       → VKM AI answers automatically (Claude)
//          • media (image/doc)    → polite acknowledgement
//         Conversation is remembered per number (whatsapp_messages),
//         Meta retries are de-duplicated, and a lead is captured on the
//         contact's first message.
//
//  Required env vars (see WHATSAPP-SETUP.md):
//    WHATSAPP_VERIFY_TOKEN, WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID,
//    ANTHROPIC_API_KEY
// ============================================================

// ── GET: verification handshake ──────────────────────────────
export async function GET(req: Request) {
  const url = new URL(req.url);

  // Temporary diagnostic: ?selftest=1&token=<verify_token>&to=<number>
  // Sends a plain text via the Graph API using the env token, and returns the
  // raw API response so send errors are visible. Gated by the verify token.
  // REMOVE after debugging.
  if (url.searchParams.get("selftest") === "1") {
    if (url.searchParams.get("token") !== process.env.WHATSAPP_VERIFY_TOKEN) {
      return new Response("Forbidden", { status: 403 });
    }
    const to = url.searchParams.get("to") || "";
    const tkn = process.env.WHATSAPP_TOKEN;
    const pnid = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";
    let response = "(no request made)";
    let status = 0;
    if (tkn && pnid && to) {
      const r = await fetch(`https://graph.facebook.com/${version}/${pnid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tkn}` },
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: "VKM AI self-test ✅" } }),
      });
      status = r.status;
      response = (await r.text()).slice(0, 1000);
    }
    return NextResponse.json({
      tokenPresent: !!tkn,
      tokenLength: tkn ? tkn.length : 0,
      phoneNumberId: pnid ?? null,
      anthropicKeyPresent: !!process.env.ANTHROPIC_API_KEY,
      sendStatus: status,
      sendResponse: response,
    });
  }

  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
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

  // Always return 200 (Meta retries on non-200). We process inline (Haiku is
  // fast); errors are logged but we avoid 5xx so Meta doesn't flood retries.
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
    const { text, interactiveId } = parseMessage(message);

    if (!from || !waMessageId) {
      return NextResponse.json({ ok: true });
    }

    if (!token || !phoneNumberId) {
      console.error("[whatsapp] missing WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID");
      return NextResponse.json({ ok: true });
    }

    const ctx = { phoneNumberId, token };
    const db = getSupabaseAdmin();

    // Dedupe: Meta re-delivers if we're slow. Skip already-handled messages.
    if (db && (await alreadyHandled(db, waMessageId))) {
      return NextResponse.json({ ok: true });
    }

    const history = db ? await loadHistory(db, from) : [];
    const isFirstContact = history.length === 0;

    // What we store as the inbound user turn (readable in history).
    const inboundLabel = text || (interactiveId ? `[tapped: ${interactiveId}]` : "[non-text message]");

    // ---- Route the message --------------------------------------------------
    // aiInput, when set, means "let VKM AI answer this". Otherwise we've already
    // replied with a menu/document/canned message inside the branch.
    let aiInput: string | null = null;
    let cannedReply: string | null = null; // outbound text we sent, for history

    if (interactiveId && CHECKLISTS[interactiveId]) {
      const c = CHECKLISTS[interactiveId];
      await sendDocument(ctx, from, {
        link: checklistLink(c.file),
        filename: c.file,
        caption: `${c.title} — from V K Munje & Company. For a review tailored to your business, just ask.`,
      });
      cannedReply = `[sent document: ${c.title}]`;
    } else if (interactiveId === "menu_checklists") {
      await sendChecklistMenu(ctx, from);
      cannedReply = "[sent checklist menu]";
    } else if (interactiveId === "action_book") {
      cannedReply = bookingMessage();
      await sendText(ctx, from, cannedReply);
    } else if (interactiveId === "action_human") {
      cannedReply = humanHandoffMessage();
      await sendText(ctx, from, cannedReply);
    } else if (interactiveId && SERVICE_PROMPTS[interactiveId]) {
      aiInput = SERVICE_PROMPTS[interactiveId];
    } else if (!text && !interactiveId) {
      // Media (image / document / audio): acknowledge politely.
      cannedReply =
        "Thank you — I've received your message. You can type your question and I'll guide you right away, or send 'menu' to see options.";
      await sendText(ctx, from, cannedReply);
    } else if (text && isGreetingOrMenu(text)) {
      await sendMainMenu(ctx, from, profileName);
      cannedReply = "[sent main menu]";
    } else {
      aiInput = text || interactiveId; // free-text question → AI
    }

    // ---- AI answer (if this turn needs one) ---------------------------------
    if (aiInput) {
      const messages: ChatMessage[] = [...history, { role: "user", content: aiInput }];
      let reply: string | null;
      try {
        reply = await callClaude(messages, { channel: "whatsapp", maxTokens: 600 });
      } catch (err) {
        console.error("[whatsapp] Claude error:", err);
        reply = null;
      }
      cannedReply =
        reply ??
        "Thank you for messaging V K Munje & Company. Our team will assist you shortly. For urgent help, call +91 9922099970 or email cma.vickymunje@gmail.com.";
      await sendText(ctx, from, cannedReply);
    }

    // ---- Persist conversation + capture lead on first contact ---------------
    if (db) {
      await recordMessage(db, from, "user", inboundLabel, waMessageId);
      if (cannedReply) await recordMessage(db, from, "assistant", cannedReply, null);
      if (isFirstContact) {
        await db.from("leads").insert({
          source: "whatsapp",
          name: profileName,
          phone: from,
          message: `First WhatsApp message: ${inboundLabel}`.slice(0, 1000),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp] handler error:", err);
    return NextResponse.json({ ok: true });
  }
}

// ── Helpers ──────────────────────────────────────────────────

function parseMessage(message: WhatsAppMessage): { text: string; interactiveId: string | null } {
  if (message.type === "text") {
    return { text: message.text?.body?.trim() ?? "", interactiveId: null };
  }
  if (message.type === "interactive") {
    const reply = message.interactive?.button_reply ?? message.interactive?.list_reply;
    return { text: reply?.title?.trim() ?? "", interactiveId: reply?.id ?? null };
  }
  if (message.type === "button") {
    return { text: message.button?.text?.trim() ?? "", interactiveId: null };
  }
  return { text: "", interactiveId: null };
}

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
  await db.from("whatsapp_messages").insert({ phone, role, content, wa_message_id: waMessageId });
}

// ── Meta webhook payload types (only the fields we read) ─────
type InteractiveReply = { id?: string; title?: string };
type WhatsAppMessage = {
  id: string;
  from: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: InteractiveReply; list_reply?: InteractiveReply };
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
