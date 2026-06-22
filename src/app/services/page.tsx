import type { Metadata } from "next";
import Link from "next/link";
import { TbCircleCheck } from "react-icons/tb";
import ServiceIcon from "@/components/ServiceIcon";
import Reveal from "@/components/Reveal";
import { serviceCategories, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "GST, Income Tax, TDS, Accounting, Cost Management, ROC/MCA, FEMA, Labour Law, Startup advisory, Project Finance and Litigation support from V K Munje & Company, Pune.",
};

export default function ServicesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Our services
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Single-window compliance &amp; advisory
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            From day-to-day tax compliance to financing growth and CFO-level
            strategy — handled by one accountable team.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-2 px-5 py-5">
          {serviceCategories.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="rounded-full border border-teal/15 px-3 py-1.5 text-xs font-medium text-teal transition-colors hover:bg-teal hover:text-white"
            >
              {s.title}
            </a>
          ))}
        </div>
      </section>

      {/* Service detail cards */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          {serviceCategories.map((svc) => (
            <Reveal key={svc.slug}>
              <article
                id={svc.slug}
                className="scroll-mt-24 rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal text-gold-light">
                    <ServiceIcon name={svc.icon} className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-teal">
                      {svc.title}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      {svc.short}
                    </p>
                  </div>
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {svc.items.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2 text-sm text-ink"
                    >
                      <TbCircleCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="mt-6 inline-block text-sm font-semibold text-gold hover:text-teal"
                >
                  Enquire about {svc.title} →
                </Link>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Process */}
        <div className="mt-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal">
              How we work
            </h2>
          </Reveal>
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Consult", "We understand your business, obligations and goals."],
              ["02", "Plan", "We map out filings, deadlines and the best position."],
              ["03", "Execute", "We file, document and keep everything in order."],
              ["04", "Advise", "Ongoing guidance so you stay ahead of every deadline."],
            ].map(([n, t, d], i) => (
              <Reveal key={n} delay={i * 0.05}>
                <li className="h-full rounded-2xl bg-white p-6 shadow-sm">
                  <span className="font-display text-3xl font-bold text-gold">
                    {n}
                  </span>
                  <h3 className="mt-2 font-display text-lg font-semibold text-teal">
                    {t}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{d}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Not sure what you need? Let&apos;s talk.
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              Book a consultation
            </Link>
            <a
              href={`tel:+91${site.contact.phones[0]}`}
              className="rounded-full border border-cream/30 px-7 py-3 text-sm font-semibold text-cream hover:bg-white/10"
            >
              Call +91 {site.contact.phones[0]}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
