"use client";

import { useState } from "react";
import { services, site } from "@/lib/site";

// No backend required: composes a pre-filled email to the firm.
// To switch to a hosted form later (e.g. Formspree), replace the
// handleSubmit body with a fetch() to your form endpoint.
export default function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const phone = String(data.get("phone") || "");
    const service = String(data.get("service") || "");
    const message = String(data.get("message") || "");

    const subject = `Enquiry: ${service || "General"} — ${name}`;
    const body = [
      `Name: ${name}`,
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
          Service needed
        </label>
        <select name="service" className={field} defaultValue="">
          <option value="" disabled>
            Select a service
          </option>
          {services.map((s) => (
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
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01]"
      >
        Send enquiry
      </button>

      {sent && (
        <p className="text-center text-sm text-teal">
          Your email app should have opened with the message ready to send. If
          not, email us directly at{" "}
          <a href={`mailto:${site.contact.email}`} className="font-semibold underline">
            {site.contact.email}
          </a>
          .
        </p>
      )}
    </form>
  );
}
