// ============================================================
//  WhatsApp Graph API helpers + interactive menu for VKM AI.
//  Used by src/app/api/whatsapp/route.ts. Sending logic and the
//  tap-able menu live here; the webhook orchestrates the flow.
// ============================================================

import { site } from "@/lib/site";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION || "v21.0";

type SendCtx = { phoneNumberId: string; token: string };

async function graphSend(ctx: SendCtx, payload: Record<string, unknown>): Promise<void> {
  const res = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${ctx.phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ctx.token}`,
      },
      body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", ...payload }),
    }
  );
  if (!res.ok) {
    console.error("[whatsapp] send failed:", res.status, (await res.text()).slice(0, 300));
  }
}

export function sendText(ctx: SendCtx, to: string, body: string): Promise<void> {
  return graphSend(ctx, {
    to,
    type: "text",
    text: { preview_url: false, body: body.slice(0, 4096) },
  });
}

type ListRow = { id: string; title: string; description?: string };
type ListSection = { title: string; rows: ListRow[] };

function sendList(
  ctx: SendCtx,
  to: string,
  opts: { header?: string; body: string; footer?: string; button: string; sections: ListSection[] }
): Promise<void> {
  return graphSend(ctx, {
    to,
    type: "interactive",
    interactive: {
      type: "list",
      ...(opts.header ? { header: { type: "text", text: opts.header.slice(0, 60) } } : {}),
      body: { text: opts.body.slice(0, 1024) },
      ...(opts.footer ? { footer: { text: opts.footer.slice(0, 60) } } : {}),
      action: { button: opts.button.slice(0, 20), sections: opts.sections },
    },
  });
}

export function sendDocument(
  ctx: SendCtx,
  to: string,
  opts: { link: string; filename: string; caption?: string }
): Promise<void> {
  return graphSend(ctx, {
    to,
    type: "document",
    document: { link: opts.link, filename: opts.filename, caption: opts.caption?.slice(0, 1024) },
  });
}

// ── Menu definitions ─────────────────────────────────────────

// Free checklists already published under /public/downloads.
export const CHECKLISTS: Record<string, { file: string; title: string }> = {
  dl_gst: { file: "gst-compliance-checklist.pdf", title: "GST Compliance Checklist" },
  dl_it: { file: "income-tax-checklist.pdf", title: "Income Tax Filing Checklist" },
  dl_roc: { file: "roc-compliance-checklist.pdf", title: "ROC Compliance Checklist" },
  dl_startup: { file: "startup-setup-checklist.pdf", title: "Startup Setup Checklist" },
};

// What a tapped service row should make the assistant talk about. The value
// is sent to Claude as the client's message so the reply stays dynamic.
export const SERVICE_PROMPTS: Record<string, string> = {
  svc_gst: "I'm interested in GST registration, returns or notices. Please give a brief intro and ask what I need.",
  svc_it: "I need help with Income Tax / ITR filing or a tax notice. Please give a brief intro and ask what I need.",
  svc_tds: "I need help with TDS / TCS. Please give a brief intro and ask what I need.",
  svc_roc: "I need help with company or LLP (ROC/MCA) compliance. Please give a brief intro and ask what I need.",
  svc_labour: "I need help with PF, ESIC or labour-law compliance. Please give a brief intro and ask what I need.",
  svc_startup: "I want to register a startup / MSME or need startup advisory. Please give a brief intro and ask what I need.",
};

export function sendMainMenu(ctx: SendCtx, to: string, name?: string | null): Promise<void> {
  const hi = name ? `Hello ${name.split(" ")[0]}! ` : "Hello! ";
  return sendList(ctx, to, {
    header: site.shortName,
    body: `${hi}Welcome to ${site.name}. I'm VKM AI. Tap an option below, or just type your question — I'll guide you right away.`,
    footer: "Cost Accountants · Pune",
    button: "View options",
    sections: [
      {
        title: "Our Services",
        rows: [
          { id: "svc_gst", title: "GST & Returns", description: "Registration, GSTR, notices, ITC" },
          { id: "svc_it", title: "Income Tax / ITR", description: "Filing, planning, notices" },
          { id: "svc_tds", title: "TDS / TCS", description: "Returns, Form 16/16A, defaults" },
          { id: "svc_roc", title: "Company / LLP (ROC)", description: "Incorporation, annual filing" },
          { id: "svc_labour", title: "PF / ESIC / Labour", description: "Registration, returns, notices" },
          { id: "svc_startup", title: "Startup / MSME", description: "DPIIT, Udyam, projections" },
        ],
      },
      {
        title: "Quick Actions",
        rows: [
          { id: "menu_checklists", title: "Free Checklists", description: "Download handy PDF checklists" },
          { id: "action_book", title: "Book Consultation", description: "Talk to our experts" },
          { id: "action_human", title: "Talk to our team", description: "Reach CMA Vicky Munje's team" },
        ],
      },
    ],
  });
}

export function sendChecklistMenu(ctx: SendCtx, to: string): Promise<void> {
  return sendList(ctx, to, {
    header: "Free Checklists",
    body: "Pick a checklist and I'll send it to you as a PDF.",
    button: "Choose one",
    sections: [
      {
        title: "Download",
        rows: [
          { id: "dl_gst", title: "GST Checklist" },
          { id: "dl_it", title: "Income Tax Checklist" },
          { id: "dl_roc", title: "ROC Checklist" },
          { id: "dl_startup", title: "Startup Checklist" },
        ],
      },
    ],
  });
}

export function bookingMessage(): string {
  return `Great! You can book a consultation here:\n${site.url}/connect\n\nOr call/WhatsApp +91 ${site.contact.phones[0]} (${site.contact.hours}). Share your name, service needed and a preferred time, and our team will confirm.`;
}

export function humanHandoffMessage(): string {
  return `Sure — our team will assist you personally. Please share your *name*, *business* and your *question*, and ${site.founder.name}'s team will get back to you shortly.\n\nUrgent? Call +91 ${site.contact.phones[0]} or email ${site.contact.email}.`;
}

// Greeting / "show me the menu" detector.
const GREETING_RE =
  /^(hi+|hey+|hello+|hii+|hlo|yo|start|menu|options?|namaste|namaskar|namaskaar|good (morning|afternoon|evening)|gm|hello there|namastey)\b/i;

export function isGreetingOrMenu(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (t.length <= 2) return true; // "hi", "hey" etc.
  return GREETING_RE.test(t);
}

export function checklistLink(file: string): string {
  return `${site.url}/downloads/${file}`;
}
