import type { Metadata } from "next";
import { Suspense } from "react";
import ConnectTabs from "@/components/ConnectTabs";

export const metadata: Metadata = {
  title: "Book a Consultation & Reviews",
  description:
    "Book a consultation with CMA Vicky Munje, and read or share client reviews of V K Munje & Company.",
};

export default function ConnectPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <div className="accent-rule mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-teal sm:text-4xl">Connect With Us</h1>
        <p className="mt-3 text-base text-muted">
          Book a consultation or see what our clients say — all in one place.
        </p>
      </div>
      <Suspense fallback={<p className="text-center text-sm text-muted">Loading…</p>}>
        <ConnectTabs />
      </Suspense>
    </section>
  );
}
