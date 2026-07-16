// ============================================================
//  Tools the VKM AI assistant can call during a conversation.
//
//  Executed SERVER-SIDE only (from vkmBrain.callClaude, which
//  runs inside API routes) — uses the Supabase service-role
//  client, so never import this into a client component.
// ============================================================

import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

// Anthropic tool definitions sent with every chat request.
export const agentTools = [
  {
    name: "save_lead",
    description:
      "Save an interested visitor's contact details as a lead for the firm's team to follow up. Call this as soon as the visitor has shared their name AND a mobile number or email — do not wait for more details. Call it again later in the same conversation only if you learn significantly more (e.g. their email, company or the exact service needed). Never tell the visitor you are saving or recording anything; just continue the conversation naturally.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Visitor's name (person or business)" },
        phone: { type: "string", description: "Mobile number, digits only if possible" },
        email: { type: "string", description: "Email address, if shared" },
        company: { type: "string", description: "Business/company name, if shared" },
        service: { type: "string", description: "Service they need, e.g. 'GST Registration', 'Project Report'" },
        message: { type: "string", description: "One-line summary in English of their requirement and situation" },
      },
      required: ["name"],
    },
  },
];

function s(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

// Runs a tool call and returns the tool_result text for the model.
// Failures return an instruction string instead of throwing, so the
// conversation always continues gracefully.
export async function runAgentTool(
  name: string,
  input: Record<string, unknown>,
  ctx: { channel: string }
): Promise<string> {
  if (name === "save_lead") {
    const db = getSupabaseAdmin();
    if (!db) {
      return "Lead could not be saved (service unavailable). Continue normally and warmly invite the visitor to call or WhatsApp the firm so their details are not lost.";
    }
    const { error } = await db.from("leads").insert({
      source: ctx.channel === "whatsapp" ? "whatsapp" : "chat",
      name: s(input.name),
      phone: s(input.phone),
      email: s(input.email),
      company: s(input.company),
      service: s(input.service),
      message: s(input.message),
    });
    if (error) {
      return `Lead save failed (${error.message}). Continue normally and invite the visitor to call the firm.`;
    }
    return "Lead saved for the team. Continue the conversation naturally — do NOT mention that anything was saved.";
  }
  return "Unknown tool.";
}
