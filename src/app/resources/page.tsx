import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources",
  description:
    "Tax and compliance due dates, guides and updates from V K Munje & Company — Cost & Management Accountants, Pune.",
};

// Edit / extend these as the year progresses.
const dueDates = [
  { date: "11th monthly", task: "GSTR-1 (monthly filers)" },
  { date: "20th monthly", task: "GSTR-3B & tax payment" },
  { date: "7th monthly", task: "TDS / TCS deposit" },
  { date: "15 Jun / Sep / Dec / Mar", task: "Advance tax instalments" },
  { date: "31st July", task: "ITR — non-audit cases" },
  { date: "31st October", task: "ITR — audit cases & tax audit report" },
  { date: "31st October", task: "MSME-1 / half-yearly returns" },
  { date: "30th November", task: "Form MGT-7 / annual ROC filings" },
];

const guides = [
  {
    tag: "Income Tax",
    title: "Old vs New Regime — which is right for you?",
    blurb:
      "A quick framework to decide your tax regime based on income, deductions and investments.",
  },
  {
    tag: "GST",
    title: "ITC: what you can claim and what you can't",
    blurb:
      "Common input-tax-credit mistakes and how to keep your claims clean and notice-proof.",
  },
  {
    tag: "Finance",
    title: "What your banker looks for in a project report",
    blurb:
      "The DSCR, projections and CMA-data essentials that get loans sanctioned faster.",
  },
  {
    tag: "Compliance",
    title: "Annual ROC calendar for private companies",
    blurb:
      "Every key MCA form and date so your company never misses a statutory filing.",
  },
];

export default function ResourcesPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Resources
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Stay ahead of every deadline
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Key compliance dates and plain-language guides to help you plan with
            confidence.
          </p>
        </div>
      </section>

      {/* Due dates */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal">
            Compliance due dates
          </h2>
          <p className="mt-3 text-muted">
            Indicative recurring deadlines. Exact dates can shift with
            notifications — confirm with us before filing.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-teal/5 text-teal">
              <tr>
                <th className="px-6 py-4 font-semibold">Due date</th>
                <th className="px-6 py-4 font-semibold">Compliance</th>
              </tr>
            </thead>
            <tbody>
              {dueDates.map((d, i) => (
                <tr
                  key={d.task}
                  className={i % 2 ? "bg-cream/40" : "bg-white"}
                >
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gold">
                    {d.date}
                  </td>
                  <td className="px-6 py-3.5 text-ink">{d.task}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Guides */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal">
              Guides &amp; insights
            </h2>
            <p className="mt-3 text-muted">
              Short reads on the questions clients ask us most. Full articles
              coming soon.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {guides.map((g) => (
              <article
                key={g.title}
                className="rounded-2xl bg-cream p-6 transition-transform hover:-translate-y-1"
              >
                <span className="inline-block rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
                  {g.tag}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">
                  {g.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {g.blurb}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Have a question about a deadline?
          </h2>
          <p className="max-w-xl text-cream/75">
            Send us a message and we&apos;ll tell you exactly what applies to
            you and by when.
          </p>
          <Link
            href="/contact"
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            Ask {site.shortName}
          </Link>
        </div>
      </section>
    </>
  );
}
