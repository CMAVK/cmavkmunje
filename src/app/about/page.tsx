import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About the Firm",
  description: `Learn about ${site.name}, a Pune-based firm of Cost & Management Accountants founded by ${site.founder.name} (${site.founder.credentials}).`,
};

const values = [
  {
    title: "Integrity",
    body: "Honest advice and transparent dealings on every engagement, however small.",
  },
  {
    title: "Diligence",
    body: "Meticulous attention to records, deadlines and the details that matter.",
  },
  {
    title: "Insight",
    body: "We read beyond the numbers to surface what they mean for your business.",
  },
  {
    title: "Partnership",
    body: "We grow when our clients grow — your success is the measure of ours.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
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

      {/* Story */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 md:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5 text-muted">
            <div className="accent-rule" />
            <h2 className="font-display text-3xl font-bold text-teal">
              Who we are
            </h2>
            <p>
              {site.name} is a professional firm of {site.profession} based in
              New Kalyani Nagar, Pune. We serve proprietors, partnership firms,
              LLPs, companies and individuals — providing the full spectrum of
              taxation, compliance and financial-advisory services from a single
              trusted desk.
            </p>
            <p>
              As Cost &amp; Management Accountants, our perspective goes beyond
              filing returns. We understand the cost structures, margins and cash
              flows that drive a business, which lets us give advice that
              genuinely improves performance — not just keeps you compliant.
            </p>
            <p className="border-l-4 border-gold pl-5 text-lg font-medium italic text-teal">
              “{site.tagline}”
            </p>
          </div>

          {/* Founder card */}
          <aside className="h-fit rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
            <Logo className="h-16 w-16" />
            <h3 className="mt-5 font-display text-xl font-bold text-teal">
              {site.founder.name}
            </h3>
            <p className="text-sm font-medium text-gold">
              {site.founder.credentials}
            </p>
            <p className="mt-2 text-sm uppercase tracking-wide text-muted">
              Founder &amp; Principal
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              An Associate Cost &amp; Management Accountant with a background in
              law and commerce, {site.founder.name.split(" ").slice(0, 2).join(" ")} brings a
              rare blend of financial, legal and managerial insight to every
              engagement.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-ink">
              <li className="flex items-center gap-2">
                <span className="text-gold">●</span> ACMA — Cost &amp; Management Accountant
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">●</span> LLB — Bachelor of Law
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gold">●</span> M.Com — Master of Commerce
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal sm:text-4xl">
              What we stand for
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl bg-cream p-6">
                <h3 className="font-display text-lg font-semibold text-teal">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-16 text-center">
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
