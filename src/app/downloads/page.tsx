import type { Metadata } from "next";
import Link from "next/link";
import { TbDownload, TbFileText } from "react-icons/tb";
import Reveal from "@/components/Reveal";
import { disclaimer, downloads } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download Centre",
  description:
    "Free downloadable GST, Income Tax, ROC and Startup compliance checklists from V K Munje & Company, Pune.",
};

export default function DownloadsPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Download centre
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Free compliance checklists
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Handy PDF checklists to keep your business on track. Download, print
            and tick off — no sign-up needed.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-2">
          {downloads.map((d, i) => (
            <Reveal key={d.file} delay={(i % 2) * 0.05}>
              <a
                href={`/downloads/${d.file}`}
                download
                className="group flex h-full items-start gap-4 rounded-2xl border border-black/5 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-gold/40 hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/8 text-teal transition-colors group-hover:bg-teal group-hover:text-gold-light">
                  <TbFileText className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
                    {d.cat}
                  </span>
                  <h2 className="mt-3 font-display text-lg font-semibold text-ink">
                    {d.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {d.desc}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold">
                    <TbDownload className="h-4 w-4" /> Download PDF
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>

        <p className="mt-10 rounded-2xl border border-gold/30 bg-gold-soft/40 p-6 text-center text-sm leading-relaxed text-ink/80">
          {disclaimer}
        </p>
      </section>

      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-5 px-5 py-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Want a checklist tailored to your business?
          </h2>
          <Link
            href="/contact"
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            Request a custom checklist
          </Link>
        </div>
      </section>
    </>
  );
}
