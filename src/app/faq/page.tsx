import type { Metadata } from "next";
import Link from "next/link";
import FaqAccordion from "@/components/FaqAccordion";
import { faqCategories, faqs, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions on GST, Income Tax, TDS, ROC, LLP, Startup and Labour Law compliance from V K Munje & Company, Pune.",
};

export default function FaqPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />

      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Knowledge base
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Frequently asked questions
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Quick answers across GST, income tax, TDS, company and LLP
            compliance, startups and labour law. Still unsure? Just ask us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <FaqAccordion faqs={faqs} categories={faqCategories} />

        <div className="mt-12 rounded-2xl bg-teal p-8 text-center text-cream">
          <h2 className="font-display text-2xl font-bold text-white">
            Didn&apos;t find your answer?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-cream/80">
            Send us your question — we&apos;re happy to help, with no obligation.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Ask {site.shortName}
          </Link>
        </div>
      </section>
    </>
  );
}
