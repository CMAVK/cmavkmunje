import type { Metadata } from "next";
import Link from "next/link";
import Calculators from "@/components/Calculators";
import { disclaimer } from "@/lib/site";

export const metadata: Metadata = {
  title: "Financial Calculators",
  description:
    "Free GST, EMI, HRA and Income Tax calculators from V K Munje & Company — quick, indicative estimates for planning.",
};

export default function ToolsPage() {
  return (
    <>
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Free tools
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Financial calculators
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Quick estimates for GST, loan EMIs, HRA exemption and income tax.
            For exact figures and planning, talk to us.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-16">
        <Calculators />
        <p className="mt-6 text-center text-xs leading-relaxed text-muted">
          These calculators provide indicative estimates only and do not
          constitute professional advice. {disclaimer}
        </p>

        <div className="mt-12 rounded-2xl bg-teal p-8 text-center text-cream">
          <h2 className="font-display text-2xl font-bold text-white">
            Need a precise computation?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-cream/80">
            We&apos;ll prepare an accurate, regime-optimised calculation for your
            exact situation.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Talk to us
          </Link>
        </div>
      </section>
    </>
  );
}
