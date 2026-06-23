"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { StarInput } from "./StarRating";
import { FaCircleCheck } from "react-icons/fa6";

const REVIEW_CATEGORIES = [
  "GST Services",
  "Taxation",
  "Labour Law",
  "ROC Compliance",
  "Overall Experience",
];

export default function FeedbackForm() {
  const supabase = getSupabase();
  const [rating, setRating] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (!supabase) {
      setError("Review service isn't configured yet. Please check back soon.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") || "");
    const company = String(data.get("company") || "");
    const category = String(data.get("category") || "");
    const review = String(data.get("review") || "");

    setBusy(true);
    try {
      const { error: dbErr } = await supabase.from("reviews").insert({
        name,
        company,
        category,
        review,
        rating,
        status: "pending",
        featured: false,
      });
      if (dbErr) throw dbErr;
      setDone(true);
      form.reset();
      setRating(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit review.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <FaCircleCheck className="h-14 w-14 text-teal" />
        <h3 className="text-xl font-bold text-teal">Thank you for your feedback!</h3>
        <p className="max-w-sm text-sm text-muted">
          Your review has been submitted and will appear on our website once approved by our team.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-ink">Your Rating *</label>
        <StarInput value={rating} onChange={setRating} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Name *</label>
          <input name="name" required className={field} placeholder="Your name" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">
            Company <span className="text-muted">(optional)</span>
          </label>
          <input name="company" className={field} placeholder="Your company" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Service Reviewed *</label>
        <select name="category" required className={field} defaultValue="">
          <option value="" disabled>Select a service</option>
          {REVIEW_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Your Review *</label>
        <textarea name="review" required rows={4} className={field} placeholder="Tell us about your experience…" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Submitting…" : "Submit Review"}
      </button>
      <p className="text-center text-xs text-muted">
        Reviews are published only after approval by our team.
      </p>
    </form>
  );
}
