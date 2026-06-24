"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingForm from "@/components/BookingForm";
import FeedbackForm from "@/components/FeedbackForm";
import ReviewsList from "@/components/ReviewsList";
import { site } from "@/lib/site";
import { FaCalendarCheck, FaClock, FaPhone } from "react-icons/fa6";

export default function ConnectTabs() {
  const params = useSearchParams();
  const initial = params.get("tab") === "reviews" ? "reviews" : "book";
  const [tab, setTab] = useState<"book" | "reviews">(initial);

  return (
    <>
      {/* Tab switch */}
      <div className="mx-auto mb-10 flex max-w-xs gap-1 rounded-full bg-cream-deep p-1 text-sm font-medium">
        <button
          onClick={() => setTab("book")}
          className={`flex-1 rounded-full py-2 transition-colors ${tab === "book" ? "bg-teal text-white" : "text-muted"}`}
        >
          Book Consultation
        </button>
        <button
          onClick={() => setTab("reviews")}
          className={`flex-1 rounded-full py-2 transition-colors ${tab === "reviews" ? "bg-teal text-white" : "text-muted"}`}
        >
          Reviews
        </button>
      </div>

      {tab === "book" ? (
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6">
            <div className="rounded-2xl bg-teal p-6 text-white">
              <FaCalendarCheck className="mb-3 h-7 w-7 text-gold" />
              <h2 className="mb-1 text-lg font-semibold">What to expect</h2>
              <p className="text-sm leading-relaxed text-white/80">
                A focused 30–60 minute session where we understand your needs and give you a clear action plan.
              </p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <FaClock className="mb-3 h-6 w-6 text-gold" />
              <h2 className="mb-2 text-base font-semibold text-ink">Office Hours</h2>
              <p className="text-sm text-muted">{site.contact.hours}</p>
              <p className="mt-1 text-sm text-muted">Online &amp; in-person available</p>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white p-6">
              <FaPhone className="mb-3 h-6 w-6 text-gold" />
              <h2 className="mb-2 text-base font-semibold text-ink">Prefer a call?</h2>
              {site.contact.phones.map((p) => (
                <a key={p} href={`tel:+91${p}`} className="block text-sm font-semibold text-teal hover:underline">
                  +91 {p}
                </a>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <BookingForm />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-14">
          <ReviewsList />
          <div className="mx-auto max-w-2xl">
            <h2 className="mb-6 text-center text-2xl font-bold text-teal">Share Your Experience</h2>
            <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <FeedbackForm />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
