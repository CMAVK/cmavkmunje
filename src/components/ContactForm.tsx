"use client";

import { useState } from "react";
import { serviceCategories, site } from "@/lib/site";

// Auto-receiving when NEXT_PUBLIC_FORMSPREE_ID is set (free at formspree.io):
// submissions arrive in the firm's inbox without leaving the page. Until then,
// it gracefully falls back to a pre-filled email (mailto) — works with no setup.
const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const phone = String(data.get("phone") || "");
    const service = String(data.get("service") || "");
    const message = String(data.get("message") || "");

    const subject = `Enquiry: ${service || "General"} — ${name}`;

    if (FORMSPREE) {
      setBusy(true);
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, company, phone, service, message, _subject: subject }),
        });
        if (res.ok) {
          form.reset();
          setSent(true);
          return;
        }
      } catch {
        /* fall through to mailto */
      } finally {
        setBusy(false);
      }
    }

    const body = [
      `Name: ${name}`,
      `Company: ${company}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Name
          </label>
          <input name="name" required className={field} placeholder="Your full name" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Phone
          </label>
          <input
            name="phone"
            required
            className={field}
            placeholder="10-digit mobile"
            inputMode="tel"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Company / business name <span className="text-muted">(optional)</span>
        </label>
        <input name="company" className={field} placeholder="Your company" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Service needed
        </label>
        <select name="service" className={field} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {serviceCategories.map((s) => (
            <option key={s.slug} value={s.title}>
              {s.title}
            </option>
          ))}
          <option value="Other">Other / Not sure</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={4}
          className={field}
          placeholder="Tell us briefly how we can help…"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Sending…" : "Send enquiry"}
      </button>

      {sent && (
        <p className="text-center text-sm text-teal">
          Thank you — your enquiry has been sent. We&apos;ll get back to you
          within one business day. You can also reach us at{" "}
          <a href={`mailto:${site.contact.email}`} className="font-semibold underline">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
