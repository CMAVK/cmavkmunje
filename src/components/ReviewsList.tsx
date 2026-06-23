"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { StarDisplay } from "./StarRating";

type Review = {
  id: string;
  name: string;
  company: string | null;
  rating: number;
  category: string;
  review: string;
  featured: boolean;
  created_at: string;
};

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }
    supabase
      .from("reviews")
      .select("*")
      .eq("status", "approved")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReviews((data as Review[]) || []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="text-center text-sm text-muted">Loading reviews…</p>;
  }

  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-black/15 bg-white/60 p-8 text-center text-sm text-muted">
        Be the first to share your experience — your approved review will appear here.
      </p>
    );
  }

  const total = reviews.length;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / total;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="flex flex-wrap items-center justify-center gap-8 rounded-2xl bg-teal p-6 text-white">
        <div className="text-center">
          <p className="text-4xl font-bold text-gold">{avg.toFixed(1)}</p>
          <div className="mt-1 flex justify-center"><StarDisplay value={Math.round(avg)} size="h-4 w-4" /></div>
          <p className="mt-1 text-xs text-white/70">Average Rating</p>
        </div>
        <div className="h-12 w-px bg-white/20" />
        <div className="text-center">
          <p className="text-4xl font-bold text-gold">{total}</p>
          <p className="mt-1 text-xs text-white/70">Total Reviews</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-5 sm:grid-cols-2">
        {reviews.map((r) => (
          <div
            key={r.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm ${
              r.featured ? "border-gold/50 ring-1 ring-gold/30" : "border-black/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <StarDisplay value={r.rating} />
              {r.featured && (
                <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                  Featured
                </span>
              )}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink">“{r.review}”</p>
            <div className="mt-4 border-t border-black/5 pt-3">
              <p className="text-sm font-semibold text-teal">{r.name}</p>
              <p className="text-xs text-muted">
                {[r.company, r.category].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
