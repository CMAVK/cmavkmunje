import { NextResponse } from "next/server";
import { faqs, serviceCategories, dueDates, site } from "@/lib/site";

// VKM AI Advisor — powered by Claude (Anthropic). Set ANTHROPIC_API_KEY in the
// environment to enable. Without a key, returns { configured: false } so the
// chat widget falls back to its built-in FAQ matcher.

const MODEL = "claude-haiku-4-5-20251001";

function buildSystemPrompt(): string {
  const services = serviceCategories
    .map((s) => `- ${s.title}: ${s.items.join(", ")}`)
    .join("\n");

  const knowledge = faqs
    .map((f) => `Q: ${f.q}\nA: ${f.a}`)
    .join("\n\n");

  const due = dueDates.map((d) => `- ${d.date}: ${d.task} (${d.cat})`).join("\n");

  return `You are "VKM AI Advisor", the friendly virtual assistant for ${site.name}, a firm of ${site.profession} based in ${site.contact.addressShort}, India. Founder: ${site.founder.name} (${site.founder.credentials}).

ROLE: Help website visitors with clear, accurate, practical answers on Indian taxation and compliance — GST, Income Tax, TDS/TCS, PF, ESIC, Professional Tax, Labour Law, ROC/MCA & company/LLP matters, startup & MSME registration, project reports, cost audit and business advisory.

STYLE:
- Be concise, warm and professional. Use simple language a business owner understands.
- Use short paragraphs or bullet points. Avoid jargon unless you explain it.
- Give genuinely helpful, specific answers — like an expert CA/CMA would in plain terms.
- For India-specific figures (rates, due dates, thresholds), use the firm's knowledge below; if unsure or if it depends on specifics, say so and recommend confirming with the firm.

IMPORTANT BOUNDARIES:
- You give general guidance, not a formal professional opinion. For anything involving the client's specific numbers, a notice, or a filing, recommend booking a consultation.
- Never invent exact rupee figures or section numbers you are not sure about. It is better to explain the concept and suggest contacting the firm.
- If asked something unrelated to the firm's services, politely steer back.
- To connect with the firm: phone +91 ${site.contact.phones[0]}, WhatsApp, email ${site.contact.email}, or the "Book Consultation" page. Office hours: ${site.contact.hours}.

FIRM SERVICES:
${services}

KEY STATUTORY DUE DATES (confirm current year before relying):
${due}

FIRM KNOWLEDGE BASE (use these as your primary reference):
${knowledge}`;
}

type ClientMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ configured: false });
  }

  let body: { messages?: ClientMessage[] };
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
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 700,
        system: buildSystemPrompt(),
        messages,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: "AI service error", detail: detail.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text =
      Array.isArray(data.content) && data.content[0]?.type === "text"
        ? data.content[0].text
        : "";

    return NextResponse.json({ configured: true, reply: text });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
