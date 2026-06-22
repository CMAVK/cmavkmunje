"use client";

import { useState } from "react";
import { TbChevronDown } from "react-icons/tb";
import type { Faq } from "@/lib/site";

export default function FaqAccordion({
  faqs,
  categories,
}: {
  faqs: Faq[];
  categories: string[];
}) {
  const [active, setActive] = useState<string>("All");
  const [open, setOpen] = useState<number | null>(null);

  const tabs = ["All", ...categories];
  const shown =
    active === "All" ? faqs : faqs.filter((f) => f.cat === active);

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setActive(t);
              setOpen(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active === t
                ? "bg-teal text-white"
                : "border border-teal/15 text-teal hover:bg-teal/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Questions */}
      <div className="mt-8 space-y-3">
        {shown.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={`${f.cat}-${i}`}
              className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="rounded-full bg-teal/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal">
                    {f.cat}
                  </span>
                  <span className="font-medium text-ink">{f.q}</span>
                </span>
                <TbChevronDown
                  className={`h-5 w-5 shrink-0 text-gold transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="border-t border-black/5 px-5 py-4 text-sm leading-relaxed text-muted">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
