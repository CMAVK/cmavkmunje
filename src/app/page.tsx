import Link from "next/link";
import { FaWhatsapp, FaPhone } from "react-icons/fa6";
import { TbCircleCheck } from "react-icons/tb";
import ServiceIcon from "@/components/ServiceIcon";
import Reveal from "@/components/Reveal";
import Counter from "@/components/Counter";
import {
  industries,
  serviceCategories,
  site,
  trustPoints,
  updates,
  whyChooseUs,
} from "@/lib/site";

const wa = "91" + site.contact.phones[0];

const stats = [
  { to: 7, suffix: "+", label: "Years of experience" },
  { to: serviceCategories.length, suffix: "", label: "Service areas" },
  { to: industries.length, suffix: "", label: "Industries served" },
  { to: 2019, suffix: "", label: "Practising since", prefix: "" },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-teal text-cream">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-28">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
              {site.profession} · Pune · Since {site.established}
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-[3.4rem]">
              Smarter compliance.{" "}
              <span className="text-gold-light">Stronger decisions.</span>{" "}
              Sustainable growth.
            </h1>
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.14em] text-gold-light sm:text-base">
              “{site.motto}”
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cream/80">
              {site.name} is a firm of {site.profession} helping businesses stay
              compliant, reduce costs and grow profitably since {site.established}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/connect"
                className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
              >
                Book Consultation
              </Link>
              <a
                href={`tel:+91${site.contact.phones[0]}`}
                className="flex items-center gap-2 rounded-full border border-cream/30 px-6 py-3 text-sm font-semibold text-cream transition-colors hover:bg-white/10"
              >
                <FaPhone className="h-4 w-4" /> Call now
              </a>
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                <FaWhatsapp className="h-4 w-4" /> WhatsApp now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-bold text-teal">
                <Counter to={s.to} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust / credentials */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
            A practice you can trust
          </h2>
          <p className="mt-3 text-muted">
            Multi-disciplinary expertise, professional ethics and a single point
            of accountability for all your compliance.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trustPoints.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.05}>
              <div className="flex h-full gap-3 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <TbCircleCheck className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
                <div>
                  <h3 className="font-display text-base font-semibold text-ink">
                    {t.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{t.note}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Service highlights */}
      <section className="bg-cream-deep">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
              Our services
            </h2>
            <p className="mt-3 text-muted">
              A complete compliance and advisory partner for proprietors, firms,
              LLPs and companies.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCategories.map((svc, i) => (
              <Reveal key={svc.slug} delay={(i % 3) * 0.05}>
                <Link
                  href={`/services#${svc.slug}`}
                  className="group block h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/8 text-teal transition-colors group-hover:bg-teal group-hover:text-gold-light">
                    <ServiceIcon name={svc.icon} className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                    {svc.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {svc.short}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
              Why businesses choose us
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {whyChooseUs.map((w, i) => (
              <Reveal key={w.title} delay={(i % 3) * 0.05}>
                <div className="h-full rounded-2xl bg-cream p-6">
                  <h3 className="font-display text-lg font-semibold text-teal">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {w.note}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
              Industries we serve
            </h2>
            <p className="mt-3 text-cream/75">
              Sector-aware advisory tailored to how your business actually runs.
            </p>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {industries.map((ind, i) => (
              <Reveal key={ind.slug} delay={(i % 5) * 0.04}>
                <Link
                  href="/industries"
                  className="flex h-full flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-colors hover:bg-white/10"
                >
                  <ServiceIcon name={ind.icon} className="h-8 w-8 text-gold-light" />
                  <span className="text-sm font-medium text-white">
                    {ind.name}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Free consultation / lead */}
      <section className="bg-cream-deep">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal>
            <div className="rounded-3xl bg-white p-8 shadow-sm md:p-12">
              <div className="grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
                <div>
                  <h2 className="font-display text-2xl font-bold text-teal sm:text-3xl">
                    Start with a free initial consultation
                  </h2>
                  <p className="mt-3 text-muted">
                    Tell us your requirement — GST, income tax, a notice, a bank
                    project report or ongoing compliance — and we&apos;ll explain
                    exactly how we can help and what it involves. No obligation.
                  </p>
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {[
                      "Free initial consultation",
                      "Free GST health check",
                      "Free compliance review",
                      "Business growth discussion",
                    ].map((x) => (
                      <li
                        key={x}
                        className="flex items-center gap-2 text-sm text-ink"
                      >
                        <TbCircleCheck className="h-4 w-4 text-gold" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-teal px-6 py-3 text-center text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  >
                    Book your consultation
                  </Link>
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  >
                    <FaWhatsapp className="h-4 w-4" /> Message on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Latest updates */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
              Compliance insights
            </h2>
            <p className="mt-3 text-muted">
              Practical pointers to help you stay ahead. Read more in our{" "}
              <Link href="/blog" className="font-semibold text-gold">
                Knowledge Centre
              </Link>
              .
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {updates.map((u, i) => (
              <Reveal key={u.title} delay={(i % 2) * 0.05}>
                <article className="h-full rounded-2xl bg-cream p-6">
                  <span className="inline-block rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
                    {u.tag}
                  </span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                    {u.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {u.note}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Need expert financial &amp; compliance advice?
          </h2>
          <p className="max-w-xl text-cream/75">
            From a single filing to complete outsourced compliance — let&apos;s
            talk about what your business needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/connect"
              className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
            >
              Book Consultation
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
