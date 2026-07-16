"use client";

import { useState, useRef, useEffect } from "react";
import { faqs, site } from "@/lib/site";
import { getSupabase } from "@/lib/supabase";
import { FaXmark, FaRegCommentDots, FaWhatsapp, FaPhone, FaCalendarCheck, FaPaperclip, FaFile } from "react-icons/fa6";

type Message = { from: "bot" | "user"; text: string; escalate?: boolean };

const wa = "91" + site.contact.phones[0];

const GREETING =
  "Hello! I'm the VKM AI Advisor. Ask me anything about GST, Income Tax, TDS, PF/ESIC, Labour Law, Company/LLP registration, MSME, project reports and more. You can also attach documents with the 📎 button. How can I help?";

const UPLOAD_ACCEPT = ".pdf,.xls,.xlsx,.doc,.docx,.zip,.jpg,.jpeg,.png";
const UPLOAD_MAX_MB = 25;
const UPLOAD_MAX_FILES = 5;

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

  // Attachment flow: files picked via the 📎 button wait in a small panel
  // where the client adds name + mobile, then everything uploads to the
  // firm's secure document store (same backend as the /upload page).
  const fileRef = useRef<HTMLInputElement>(null);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [contact, setContact] = useState({ name: "", phone: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState("");

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing, attachFiles.length]);

  function pickFiles(list: FileList | null) {
    if (!list) return;
    setUploadErr("");
    const incoming = Array.from(list).filter((f) => {
      if (f.size > UPLOAD_MAX_MB * 1024 * 1024) {
        setUploadErr(`"${f.name}" is over ${UPLOAD_MAX_MB} MB and was skipped.`);
        return false;
      }
      return true;
    });
    setAttachFiles((prev) => [...prev, ...incoming].slice(0, UPLOAD_MAX_FILES));
    if (fileRef.current) fileRef.current.value = "";
  }

  async function sendAttachments() {
    const name = contact.name.trim();
    const phone = contact.phone.trim();
    if (!name || !phone) {
      setUploadErr("Please add your name and mobile so we know whose documents these are.");
      return;
    }
    const supabase = getSupabase();
    if (!supabase) {
      setUploadErr(`Upload isn't available right now — please use ${site.url}/upload or WhatsApp us.`);
      return;
    }
    setUploading(true);
    setUploadErr("");
    try {
      const stamp = Date.now();
      const safeClient = name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
      for (let i = 0; i < attachFiles.length; i++) {
        const file = attachFiles[i];
        const safeName = file.name.replace(/[^a-z0-9.\-_]+/gi, "_");
        const path = `${safeClient}/${stamp}-${i}-${safeName}`;
        const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("documents").insert({
          client_name: name,
          phone,
          category: "Chat Upload",
          file_name: file.name,
          file_path: path,
        });
        if (dbErr) throw dbErr;
      }

      // Email the firm about the submission (non-blocking).
      const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      if (FORMSPREE) {
        fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: `New chat document upload — ${name}`,
            client: name,
            phone,
            category: "Chat Upload",
            files: attachFiles.map((f) => f.name).join(", "),
          }),
        }).catch(() => {});
      }

      const fileNames = attachFiles.map((f) => f.name).join(", ");
      setAttachFiles([]);
      // Tell the AI what happened so it acknowledges naturally — and, since
      // name + mobile are included, it saves the visitor as a lead too.
      await handleSend(`I have attached document(s) for your review: ${fileNames}. My name is ${name}, mobile ${phone}.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setUploadErr(msg + ` — please try again or use ${site.url}/upload.`);
    } finally {
      setUploading(false);
    }
  }

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

          {/* Attachment panel — appears after files are picked via 📎 */}
          {attachFiles.length > 0 && (
            <div className="space-y-2 border-t border-black/5 bg-cream/60 p-3">
              <p className="text-xs font-semibold text-ink">Send documents to our team</p>
              <ul className="space-y-1">
                {attachFiles.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-1.5 text-xs text-ink ring-1 ring-black/5">
                    <FaFile className="h-3 w-3 shrink-0 text-teal" />
                    <span className="flex-1 truncate">{f.name}</span>
                    {!uploading && (
                      <button onClick={() => setAttachFiles((prev) => prev.filter((_, idx) => idx !== i))} aria-label="Remove file" className="text-muted hover:text-red-500">
                        <FaXmark className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                <input
                  value={contact.name}
                  onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  placeholder="Your name *"
                  className="w-1/2 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-teal"
                />
                <input
                  value={contact.phone}
                  onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="Mobile *"
                  inputMode="tel"
                  className="w-1/2 rounded-lg border border-black/10 bg-white px-2.5 py-1.5 text-xs text-ink outline-none focus:border-teal"
                />
              </div>
              {uploadErr && <p className="text-xs text-red-600">{uploadErr}</p>}
              <div className="flex gap-2">
                <button
                  onClick={sendAttachments}
                  disabled={uploading}
                  className="flex-1 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Send securely"}
                </button>
                <button
                  onClick={() => { setAttachFiles([]); setUploadErr(""); }}
                  disabled={uploading}
                  className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-ink"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-black/5 p-3">
            <input ref={fileRef} type="file" multiple accept={UPLOAD_ACCEPT} className="hidden" onChange={(e) => pickFiles(e.target.files)} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-cream text-teal transition-colors hover:border-teal disabled:opacity-50"
              aria-label="Attach documents"
              title="Attach documents"
            >
              <FaPaperclip className="h-4 w-4" />
            </button>
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
