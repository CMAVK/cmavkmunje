import type { Metadata } from "next";
import Link from "next/link";
import {
  TbTargetArrow, TbEye, TbCalendarStats, TbBriefcase,
  TbCertificate, TbMapPin, TbWorld,
} from "react-icons/tb";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";
import { coreValues, site, timeline } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Firm",
  description: `About ${site.name}, a Pune-based firm of Cost & Management Accountants founded by ${site.founder.name} (${site.founder.credentials}), with associate ${site.partner.name} (${site.partner.credentials}).`,
};

const team = [
  {
    name: site.founder.name,
    creds: site.founder.credentials,
    role: site.founder.role,
    initials: "VM",
    expertise: [
      "Cost Accounting & Cost Audit",
      "GST Advisory",
      "Direct Taxation",
      "Corporate Compliance",
      "Project Finance",
      "Business Advisory",
    ],
  },
  {
    name: site.partner.name,
    creds: site.partner.credentials,
    role: site.partner.role,
    initials: "DM",
    expertise: [
      "Audit & Assurance",
      "Income Tax",
      "Banking Advisory",
      "Corporate Compliance",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            About us
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            A firm built on numbers and trust
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Since {site.established}, {site.name} has helped businesses turn
            compliance obligations into a foundation for confident growth.
          </p>
        </div>
      </section>

      {/* Overview */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_0.7fr]">
          <Reveal className="space-y-5 text-muted">
            <div className="accent-rule" />
            <h2 className="font-display text-3xl font-bold text-teal">
              Firm overview
            </h2>
            <p>
              {site.name} is a professionally managed firm of {site.profession}{" "}
              based in New Kalyani Nagar, Pune. We serve proprietors, partnership
              firms, LLPs, companies, trusts and individuals — providing the full
              spectrum of taxation, compliance and financial-advisory services
              from a single trusted desk.
            </p>
            <p>
              As Cost &amp; Management Accountants working alongside a Chartered
              Accountant, our perspective is multi-disciplinary. We understand the
              cost structures, margins and cash flows that drive a business, which
              lets us give advice that genuinely improves performance — not just
              keeps you compliant.
            </p>
            <p className="border-l-4 border-gold pl-5 text-lg font-medium italic text-teal">
              {site.tagline}.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <aside className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              {/* Brand lockup — clean emblem + name (no card-edge lines) */}
              <div className="flex flex-col items-center bg-cream-deep/40 px-7 pb-6 pt-8 text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo-mark.png"
                  alt={`${site.name} emblem`}
                  className="mb-4 h-20 w-auto"
                />
                <p className="font-display text-xl font-bold tracking-wide text-teal">
                  V K MUNJE &amp; CO.
                </p>
                <div className="my-2 h-px w-32 bg-gold" />
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  Cost Accountants
                </p>
              </div>

              {/* At a glance */}
              <div className="px-7 py-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold text-teal">
                    At a glance
                  </h3>
                  <span className="rounded-full bg-teal/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-teal">
                    ICMAI Registered
                  </span>
                </div>
                <ul className="space-y-3.5 text-sm">
                  {[
                    { icon: TbCalendarStats, label: "Established", value: site.established },
                    { icon: TbBriefcase, label: "Practice", value: site.profession },
                    { icon: TbCertificate, label: "Registration", value: "ICMAI" },
                    { icon: TbMapPin, label: "Location", value: "Kalyani Nagar, Pune" },
                    { icon: TbWorld, label: "Reach", value: "PAN India" },
                  ].map((row) => (
                    <li key={row.label} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/10 text-gold">
                        <row.icon className="h-4 w-4" />
                      </span>
                      <span className="text-muted">{row.label}</span>
                      <span className="ml-auto text-right font-medium text-ink">
                        {row.value}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-xl bg-teal px-4 py-3 text-center">
                  <p className="text-[11px] uppercase tracking-wide text-cream/60">
                    Principal
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {site.founder.name}
                  </p>
                  <p className="text-xs text-gold-light">
                    {site.founder.credentials}
                  </p>
                </div>
              </div>
            </aside>
          </Reveal>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-5 py-20 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl bg-cream p-8">
              <TbTargetArrow className="h-9 w-9 text-gold" />
              <h2 className="mt-4 font-display text-2xl font-bold text-teal">
                Our mission
              </h2>
              <p className="mt-2 text-muted">
                To empower businesses with accurate, timely financial and
                compliance solutions that reduce risk, control cost and create
                room to grow.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl bg-cream p-8">
              <TbEye className="h-9 w-9 text-gold" />
              <h2 className="mt-4 font-display text-2xl font-bold text-teal">
                Our vision
              </h2>
              <p className="mt-2 text-muted">
                To be a trusted advisory partner for businesses across India,
                known for integrity, expertise and a genuinely client-focused
                approach.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Core values */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
            Core values
          </h2>
          <p className="mt-3 text-muted">
            The principles behind every engagement, and the professional ethics
            and confidentiality we are bound by as practising professionals.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {coreValues.map((v, i) => (
            <Reveal key={v.title} delay={(i % 5) * 0.05}>
              <div className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-teal">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm text-muted">{v.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-cream-deep">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
              Leadership team
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal font-display text-lg font-bold text-gold-light">
                      {m.initials}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-teal">
                        {m.name}
                      </h3>
                      <p className="text-sm font-medium text-gold">{m.creds}</p>
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {m.role}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm font-medium text-ink">
                    Areas of expertise
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {m.expertise.map((e) => (
                      <li
                        key={e}
                        className="rounded-full bg-teal/8 px-3 py-1 text-xs font-medium text-teal"
                      >
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
            Our journey
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={(i % 4) * 0.06}>
              <div className="h-full rounded-2xl border-l-4 border-gold bg-white p-6 shadow-sm">
                <p className="font-display text-2xl font-bold text-teal">
                  {t.year}
                </p>
                <p className="mt-2 text-sm text-muted">{t.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <span className="rounded-xl bg-white px-3 py-2">
            <Logo className="h-12" />
          </span>
          <h2 className="font-display text-3xl font-bold text-white">
            Work with a firm that gets your business
          </h2>
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
