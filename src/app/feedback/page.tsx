import type { Metadata } from "next";
import FeedbackForm from "@/components/FeedbackForm";
import ReviewsList from "@/components/ReviewsList";

export const metadata: Metadata = {
  title: "Client Reviews & Feedback",
  description:
    "Read what clients say about V K Munje & Company and share your own experience.",
};

export default function FeedbackPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <div className="accent-rule mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-teal sm:text-4xl">Client Reviews</h1>
        <p className="mt-3 text-base text-muted">
          The experience of the businesses we serve — and a place to share yours.
        </p>
      </div>

      {/* Approved reviews */}
      <div className="mb-16">
        <ReviewsList />
      </div>

      {/* Submit a review */}
      <div className="mx-auto max-w-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold text-teal">Share Your Experience</h2>
        <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
          <FeedbackForm />
        </div>
      </div>
    </section>
  );
}
