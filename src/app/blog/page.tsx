import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";
import { posts, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Knowledge Centre",
  description:
    "Practical articles on GST, income tax, ROC compliance and finance from V K Munje & Company, Cost & Management Accountants, Pune.",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function BlogPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Knowledge centre
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Insights &amp; guides
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Plain-language articles on the questions our clients ask most —
            written by {site.shortName}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.slug} delay={(i % 3) * 0.05}>
              <Link
                href={`/blog/${p.slug}`}
                className="flex h-full flex-col rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-md"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
                    {p.cat}
                  </span>
                  <span className="text-xs text-muted">{fmt(p.date)}</span>
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                  {p.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {p.excerpt}
                </p>
                <span className="mt-4 text-sm font-semibold text-gold">
                  Read article →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Have a specific question?
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
