import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { site } from "@/lib/site";
import { FaCalendarCheck, FaClock, FaPhone } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Book a Consultation",
  description:
    "Schedule a consultation with CMA Vicky Munje — GST, Income Tax, Labour Law, ROC compliance and business advisory.",
};

export default function BookPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="accent-rule mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-teal sm:text-4xl">Book a Consultation</h1>
        <p className="mt-3 text-base text-muted">
          Schedule a one-on-one session with CMA Vicky Munje. We&apos;ll get back to confirm within one business day.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Info sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-teal p-6 text-white">
            <FaCalendarCheck className="mb-3 h-7 w-7 text-gold" />
            <h2 className="mb-1 text-lg font-semibold">What to expect</h2>
            <p className="text-sm leading-relaxed text-white/80">
              A focused 30–60 minute session where we understand your specific compliance needs and give you a clear action plan.
            </p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <FaClock className="mb-3 h-6 w-6 text-gold" />
            <h2 className="mb-2 text-base font-semibold text-ink">Office Hours</h2>
            <p className="text-sm text-muted">{site.contact.hours}</p>
            <p className="mt-1 text-sm text-muted">Online & in-person sessions available</p>
          </div>

          <div className="rounded-2xl border border-black/10 bg-white p-6">
            <FaPhone className="mb-3 h-6 w-6 text-gold" />
            <h2 className="mb-2 text-base font-semibold text-ink">Prefer a call?</h2>
            <p className="text-sm text-muted mb-2">Call us directly:</p>
            {site.contact.phones.map((p) => (
              <a
                key={p}
                href={`tel:+91${p}`}
                className="block text-sm font-semibold text-teal hover:underline"
              >
                +91 {p}
              </a>
            ))}
          </div>
        </div>

        {/* Booking form */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <BookingForm />
          </div>
        </div>
      </div>
    </section>
  );
}
