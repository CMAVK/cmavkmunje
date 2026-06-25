import { NextResponse } from "next/server";
import { callClaude, type ChatMessage } from "@/lib/vkmBrain";

// VKM AI — website chat widget endpoint. Powered by Claude (Anthropic).
// Set ANTHROPIC_API_KEY in the environment to enable. Without a key it
// returns { configured: false } so the widget falls back to its built-in
// FAQ matcher. The bot's persona and rules live in src/lib/vkmBrain.ts
// and are shared with the WhatsApp channel.

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const messages = (body.messages || [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12); // keep recent context

  if (messages.length === 0) {
    return NextResponse.json({ error: "No messages" }, { status: 400 });
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
