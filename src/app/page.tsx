import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
import { services, site } from "@/lib/site";

const stats = [
  { value: "6+", label: "Years of practice" },
  { value: "8", label: "Core service lines" },
  { value: "200+", label: "Clients served" },
  { value: "100%", label: "Compliance focus" },
];

const why = [
  {
    title: "CMA-led expertise",
    body: "Guidance rooted in cost & management accounting — not just compliance, but decisions that improve your bottom line.",
  },
  {
    title: "One firm, every filing",
    body: "GST, income tax, TDS, ROC and finance under one roof, so nothing falls between the cracks.",
  },
  {
    title: "Proactive, not reactive",
    body: "Due-date reminders, planning ahead of deadlines and advisory that anticipates risk before it becomes a notice.",
  },
  {
    title: "Clear, honest counsel",
    body: "Plain-language advice and transparent timelines — you always know where your compliance stands.",
  },
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
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/5 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
              {site.profession} · Pune
            </span>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
              Clarity in compliance.
              <br />
              <span className="text-gold-light">Confidence in every decision.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-cream/80">
              {site.name} is a firm of Cost &amp; Management Accountants helping
              businesses across Pune stay compliant and grow — from GST and
              income tax to project finance and Virtual CFO support.
            </p>
            <p className="mt-4 text-base italic text-gold-light/90">
              “{site.tagline}”
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
              >
                Book a consultation
              </Link>
              <Link
                href="/services"
                className="rounded-full border border-cream/30 px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-white/10"
              >
                Explore services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-4xl font-bold text-teal">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
            What we do
          </h2>
          <p className="mt-3 text-muted">
            A complete compliance and advisory partner for proprietors, firms,
            LLPs and companies.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => (
            <Link
              key={svc.slug}
              href="/services"
              className="group rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal/8 text-teal transition-colors group-hover:bg-teal group-hover:text-gold-light">
                <ServiceIcon slug={svc.slug} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                {svc.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {svc.short}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Why choose us */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div className="accent-rule mb-5" />
              <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
                Why businesses choose us
              </h2>
              <p className="mt-4 text-muted">
                We combine the rigour of a cost accountant with the
                practicality of a business partner — so compliance becomes a
                source of confidence, not stress.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-block font-semibold text-gold hover:text-teal"
              >
                More about the firm →
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {why.map((w) => (
                <div key={w.title} className="rounded-2xl bg-cream p-6">
                  <h3 className="font-display text-lg font-semibold text-teal">
                    {w.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {w.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
            Let&apos;s get your compliance in order
          </h2>
          <p className="max-w-xl text-cream/75">
            Whether it&apos;s a GST notice, a pending ITR, a bank loan project
            report or ongoing CFO support — we&apos;re ready to help.
          </p>
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
