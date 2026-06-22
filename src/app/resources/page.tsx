import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { calendars, disclaimer, dueDates, lastReviewed, site, updates } from "@/lib/site";

export const metadata: Metadata = {
  title: "Resources & Compliance Calendar",
  description:
    "Compliance due dates for GST, TDS and ROC, plus practical updates from V K Munje & Company — Cost & Management Accountants, Pune.",
};

export default function ResourcesPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Resources
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Stay ahead of every deadline
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Key compliance dates and practical updates to help you plan with
            confidence.
          </p>
        </div>
      </section>

      {/* Due dates */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <Reveal className="max-w-2xl">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-3xl font-bold text-teal">
            Compliance due dates
          </h2>
          <p className="mt-3 text-muted">
            Indicative recurring deadlines. Exact dates can shift with
            notifications — confirm with us before filing.
          </p>
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gold">
            Last reviewed: {lastReviewed}
          </p>
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-teal/5 text-teal">
              <tr>
                <th className="px-6 py-4 font-semibold">Due date</th>
                <th className="px-6 py-4 font-semibold">Compliance</th>
                <th className="hidden px-6 py-4 font-semibold sm:table-cell">
                  Area
                </th>
              </tr>
            </thead>
            <tbody>
              {dueDates.map((d, i) => (
                <tr key={d.task} className={i % 2 ? "bg-cream/40" : "bg-white"}>
                  <td className="whitespace-nowrap px-6 py-3.5 font-medium text-gold">
                    {d.date}
                  </td>
                  <td className="px-6 py-3.5 text-ink">{d.task}</td>
                  <td className="hidden px-6 py-3.5 text-muted sm:table-cell">
                    {d.cat}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Knowledge / updates */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <Reveal className="max-w-2xl">
            <div className="accent-rule mb-5" />
            <h2 className="font-display text-3xl font-bold text-teal">
              Updates &amp; insights
            </h2>
            <p className="mt-3 text-muted">
              Short, practical notes on the issues clients ask us about most.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
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

          <div className="mt-12 rounded-2xl border border-dashed border-teal/30 bg-cream p-8 text-center">
            <h3 className="font-display text-lg font-semibold text-teal">
              Compliance calendars
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
              Downloadable {calendars.join(", ")} are on the way. Want a copy for
              your business now? Ask us and we&apos;ll send the relevant one.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-block rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
            >
              Request a calendar
            </Link>
          </div>
        </div>
      </section>

      {/* Legal / freshness disclaimer */}
      <section className="bg-cream">
        <div className="mx-auto max-w-4xl px-5 pb-16">
          <div className="rounded-2xl border border-gold/30 bg-gold-soft/40 p-6 text-center">
            <p className="text-sm leading-relaxed text-ink/80">{disclaimer}</p>
          </div>
        </div>
      </section>

      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Have a question about a deadline?
          </h2>
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
