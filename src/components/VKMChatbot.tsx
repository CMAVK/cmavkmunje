"use client";

import { useState, useRef, useEffect } from "react";
import { faqs, site } from "@/lib/site";
import { FaXmark, FaRegCommentDots, FaWhatsapp, FaPhone, FaCalendarCheck } from "react-icons/fa6";

type Message = { from: "bot" | "user"; text: string; escalate?: boolean };

const wa = "91" + site.contact.phones[0];

const GREETING =
  "Hello! I'm the VKM AI Advisor. Ask me anything about GST, Income Tax, TDS, PF/ESIC, Labour Law, Company/LLP registration, MSME, project reports and more. How can I help?";

const SUGGESTED = [
  "How can I register for GST?",
  "What is the due date for GSTR-3B?",
  "When is PF registration mandatory?",
  "How do I respond to an Income Tax notice?",
  "Can I register an LLP online?",
  "What is the tax audit limit?",
];

// Built-in fallback matcher (used if the AI service isn't configured).
function findFaqAnswer(query: string): string | null {
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  if (words.length === 0) return null;
  let bestScore = 0;
  let bestAnswer = "";
  for (const faq of faqs) {
    const haystack = (faq.q + " " + faq.a).toLowerCase();
    const score = words.filter((w) => haystack.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      bestAnswer = faq.a;
    }
  }
  return bestScore >= 2 ? bestAnswer : null;
}

export default function VKMChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ from: "bot", text: GREETING }]);
  const [input, setInput] = useState("");
  const [showSuggested, setShowSuggested] = useState(true);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  async function handleSend(text: string) {
    const q = text.trim();
    if (!q || typing) return;

    const history = [...messages, { from: "user" as const, text: q }];
    setMessages(history);
    setInput("");
    setShowSuggested(false);
    setTyping(true);

    try {
      const apiMessages = history
        .filter((m) => !m.escalate)
        .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.configured && data.reply) {
        setMessages((m) => [...m, { from: "bot", text: data.reply }]);
      } else {
        // Fallback to built-in FAQ matcher.
        const answer = findFaqAnswer(q);
        setMessages((m) => [
          ...m,
          answer
            ? { from: "bot", text: answer }
            : {
                from: "bot",
                text: "I don't have a confident answer for that one. Would you like to connect with CMA Vicky Munje directly?",
                escalate: true,
              },
        ]);
      }
    } catch {
      const answer = findFaqAnswer(q);
      setMessages((m) => [
        ...m,
        answer
          ? { from: "bot", text: answer }
          : {
              from: "bot",
              text: "Sorry, I'm having trouble right now. Please reach us on WhatsApp or call us.",
              escalate: true,
            },
      ]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* Launcher — right side, sits above the WhatsApp/Call/Email stack */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="VKM AI Advisor"
        className="fixed bottom-52 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-teal text-white shadow-xl transition-transform hover:scale-110"
      >
        {open ? <FaXmark className="h-6 w-6" /> : <FaRegCommentDots className="h-6 w-6" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-72 right-4 z-50 flex max-h-[70vh] w-80 flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 sm:w-96">
          <div className="flex items-center gap-3 rounded-t-2xl bg-teal px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
              <FaRegCommentDots className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">VKM AI Advisor</p>
              <p className="text-xs text-white/70">Powered by AI · Always online</p>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/70 hover:text-white" aria-label="Close chat">
              <FaXmark className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto p-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.from === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    msg.from === "user" ? "bg-teal text-white rounded-br-sm" : "bg-cream-deep text-ink rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                {msg.escalate && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={`https://wa.me/${wa}?text=${encodeURIComponent("Hello, I need expert advice.")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-xs font-semibold text-white">
                      <FaWhatsapp className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <a href={`tel:+91${site.contact.phones[0]}`} className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">
                      <FaPhone className="h-3 w-3" /> Call Now
                    </a>
                    <a href="/connect" className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white">
                      <FaCalendarCheck className="h-3.5 w-3.5" /> Book
                    </a>
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-cream-deep px-3.5 py-3 text-ink w-fit">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60 [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60 [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal/60" />
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {showSuggested && (
            <div className="border-t border-black/5 px-4 pb-2 pt-3">
              <p className="mb-2 text-xs font-medium text-muted">Suggested questions</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED.map((q) => (
                  <button key={q} onClick={() => handleSend(q)} className="rounded-full border border-teal/30 bg-cream-deep px-2.5 py-1 text-xs text-teal transition-colors hover:bg-teal hover:text-white">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-black/5 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask a compliance question…"
              className="flex-1 rounded-full border border-black/10 bg-cream px-4 py-2 text-sm text-ink outline-none focus:border-teal"
            />
            <button onClick={() => handleSend(input)} disabled={typing} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal text-white transition-transform hover:scale-105 disabled:opacity-50" aria-label="Send">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M3.105 2.289a.75.75 0 00-.826.95l1.903 6.557H13.5a.75.75 0 010 1.5H4.182l-1.903 6.557a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
