"use client";

import { useState } from "react";
import { serviceCategories, site } from "@/lib/site";

const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_BOOK_ID || process.env.NEXT_PUBLIC_FORMSPREE_ID;

const timeSlots = [
  "10:00 AM – 11:00 AM",
  "11:00 AM – 12:00 PM",
  "12:00 PM – 1:00 PM",
  "2:00 PM – 3:00 PM",
  "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM",
  "5:00 PM – 6:00 PM",
];

export default function BookingForm() {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "");
    const mobile = String(data.get("mobile") || "");
    const email = String(data.get("email") || "");
    const service = String(data.get("service") || "");
    const date = String(data.get("date") || "");
    const time = String(data.get("time") || "");
    const message = String(data.get("message") || "");

    const subject = `Consultation Booking: ${service || "General"} — ${name} on ${date}`;

    if (FORMSPREE) {
      setBusy(true);
      try {
        const res = await fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ name, mobile, email, service, date, time, message, _subject: subject }),
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
      `Mobile: ${mobile}`,
      `Email: ${email}`,
      `Service: ${service}`,
      `Preferred Date: ${date}`,
      `Preferred Time: ${time}`,
      "",
      message,
    ].join("\n");
    window.location.href = `mailto:${site.contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-8 w-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-teal">Booking Request Received!</h3>
        <p className="max-w-sm text-sm text-muted">
          Thank you, {`your consultation request has been submitted`}. Our team will confirm your appointment within one business day.
        </p>
        <p className="text-sm text-muted">
          Questions? Call us at{" "}
          <a href={`tel:+91${site.contact.phones[0]}`} className="font-semibold text-teal hover:underline">
            +91 {site.contact.phones[0]}
          </a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Full Name *</label>
          <input name="name" required className={field} placeholder="Your full name" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Mobile *</label>
          <input name="mobile" required inputMode="tel" className={field} placeholder="10-digit mobile number" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
        <input name="email" type="email" className={field} placeholder="your@email.com" />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Service Required *</label>
        <select name="service" required className={field} defaultValue="">
          <option value="" disabled>Select a service</option>
          {serviceCategories.map((s) => (
            <option key={s.slug} value={s.title}>{s.title}</option>
          ))}
          <option value="Other / Not sure">Other / Not sure</option>
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Preferred Date *</label>
          <input
            name="date"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            className={field}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Preferred Time *</label>
          <select name="time" required className={field} defaultValue="">
            <option value="" disabled>Select a slot</option>
            {timeSlots.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">
          Message <span className="text-muted">(optional)</span>
        </label>
        <textarea
          name="message"
          rows={3}
          className={field}
          placeholder="Briefly describe what you'd like to discuss…"
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Request Consultation"}
      </button>

      <p className="text-center text-xs text-muted">
        We&apos;ll confirm your appointment within one business day.
      </p>
    </form>
  );
}
