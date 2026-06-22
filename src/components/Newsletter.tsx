"use client";

import { useState } from "react";
import { site } from "@/lib/site";

// Auto-receiving when NEXT_PUBLIC_FORMSPREE_ID is set in the environment
// (free at formspree.io). Until then it falls back to a pre-filled email.
const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    if (FORMSPREE) {
      setBusy(true);
      try {
        await fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ email, _subject: "Newsletter signup" }),
        });
        setDone(true);
      } catch {
        window.location.href = `mailto:${site.contact.email}?subject=Newsletter%20signup&body=Please%20add%20${encodeURIComponent(email)}%20to%20your%20updates.`;
      } finally {
        setBusy(false);
      }
    } else {
      window.location.href = `mailto:${site.contact.email}?subject=Newsletter%20signup&body=Please%20add%20${encodeURIComponent(email)}%20to%20your%20updates.`;
      setDone(true);
    }
  }

  if (done) {
    return (
      <p className="text-sm text-gold-light">
        Thank you — we&apos;ll keep you posted on key compliance updates.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        aria-label="Email address"
        className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-cream/50 outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
      >
        {busy ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
