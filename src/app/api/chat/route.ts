import { NextResponse } from "next/server";
import { callClaude, type ChatMessage } from "@/lib/vkmBrain";

// VKM AI — website chat widget endpoint. Powered by Claude (Anthropic).
// Set ANTHROPIC_API_KEY in the environment to enable. Without a key it
// returns { configured: false } so the widget falls back to its built-in
// FAQ matcher. The bot's persona and rules live in src/lib/vkmBrain.ts
// and are shared with the WhatsApp channel.

// Abuse limits — every call costs Anthropic credits, so cap message size and
// how often one visitor may ask. The rate window is per server instance
// (memory resets on cold start), which is enough to stop casual flooding.
const MAX_MESSAGE_CHARS = 2000;
const MAX_TOTAL_CHARS = 8000;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 10 * 60 * 1000; // per 10 minutes
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > RATE_LIMIT;
}

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages — please wait a few minutes, or call/WhatsApp us." },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content
    )
    .slice(-12) // keep recent context
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
  }
  const latest = body.messages![body.messages!.length - 1];
  if (typeof latest?.content === "string" && latest.content.length > MAX_MESSAGE_CHARS) {
    return NextResponse.json(
      { error: "Message is too long — please keep it under 2,000 characters." },
      { status: 413 }
    );
  }
  // Drop the oldest turns until the conversation fits the budget.
  while (
    messages.length > 1 &&
    messages.reduce((n, m) => n + m.content.length, 0) > MAX_TOTAL_CHARS
  ) {
    messages.shift();
  }

  try {
    const reply = await callClaude(messages, { channel: "web" });
    if (reply === null) {
      return NextResponse.json({ configured: false });
    }
    return NextResponse.json({ configured: true, reply });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}
