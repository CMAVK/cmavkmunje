import type { Metadata } from "next";
import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
import Reveal from "@/components/Reveal";
import { industries, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Industries We Serve",
  description:
    "Sector-specific tax, cost and compliance advisory for manufacturing, construction, real estate, trading, startups, IT, healthcare, education, NGOs and logistics.",
};

export default function IndustriesPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Industries we serve
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Advisory tailored to your sector
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Every industry has its own cost structure, tax treatment and
            compliance map. We bring sector-aware solutions to each.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((ind, i) => (
            <Reveal key={ind.slug} delay={(i % 3) * 0.05}>
              <div className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/8 text-teal">
                  <ServiceIcon name={ind.icon} className="h-6 w-6" />
                </div>
                <h2 className="mt-5 font-display text-lg font-semibold text-ink">
                  {ind.name}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {ind.note}
                </p>
                <Link
                  href="/contact"
                  className="mt-5 text-sm font-semibold text-gold hover:text-teal"
                >
                  Discuss your requirement →
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Don&apos;t see your industry?
          </h2>
          <p className="max-w-xl text-cream/75">
            We work with businesses of every kind. Tell us about yours and
            we&apos;ll tailor our advisory to fit.
          </p>
          <Link
            href="/contact"
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            Get in touch
          </Link>
        </div>
      </section>
    </>
  );
}
