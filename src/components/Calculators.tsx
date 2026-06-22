"use client";

import { useState } from "react";
import {
  TbReceiptTax,
  TbHomeDollar,
  TbBuildingBank,
  TbReportMoney,
} from "react-icons/tb";

const inr = (n: number) =>
  "₹" + Math.round(n).toLocaleString("en-IN");

const field =
  "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";
const label = "mb-1.5 block text-sm font-medium text-ink";

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between py-2 ${
        strong ? "border-t border-black/10 font-semibold text-teal" : "text-ink"
      }`}
    >
      <span className={strong ? "" : "text-muted"}>{k}</span>
      <span>{v}</span>
    </div>
  );
}

/* ---------------- GST ---------------- */
function GstCalc() {
  const [amount, setAmount] = useState(10000);
  const [rate, setRate] = useState(18);
  const [mode, setMode] = useState<"add" | "remove">("add");

  let base = amount;
  let gst = 0;
  let total = amount;
  if (mode === "add") {
    gst = (amount * rate) / 100;
    total = amount + gst;
    base = amount;
  } else {
    base = amount / (1 + rate / 100);
    gst = amount - base;
    total = amount;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className={label}>Amount (₹)</label>
          <input
            type="number"
            className={field}
            value={amount}
            onChange={(e) => setAmount(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>GST rate (%)</label>
          <select
            className={field}
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
          >
            {[0, 3, 5, 12, 18, 28].map((r) => (
              <option key={r} value={r}>
                {r}%
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Mode</label>
          <div className="flex gap-2">
            {(["add", "remove"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                  mode === m
                    ? "bg-teal text-white"
                    : "border border-teal/15 text-teal"
                }`}
              >
                {m === "add" ? "Add GST" : "Remove GST"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-cream p-5">
        <Row k="Base amount" v={inr(base)} />
        <Row k={`GST @ ${rate}%`} v={inr(gst)} />
        <Row k="CGST" v={inr(gst / 2)} />
        <Row k="SGST" v={inr(gst / 2)} />
        <Row k="Total amount" v={inr(total)} strong />
      </div>
    </div>
  );
}

/* ---------------- EMI ---------------- */
function EmiCalc() {
  const [p, setP] = useState(1000000);
  const [rate, setRate] = useState(9);
  const [years, setYears] = useState(15);

  const r = rate / 12 / 100;
  const n = years * 12;
  const emi =
    r === 0 ? p / n : (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = emi * n;
  const interest = total - p;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className={label}>Loan amount (₹)</label>
          <input
            type="number"
            className={field}
            value={p}
            onChange={(e) => setP(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>Interest rate (% p.a.)</label>
          <input
            type="number"
            step="0.1"
            className={field}
            value={rate}
            onChange={(e) => setRate(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>Tenure (years)</label>
          <input
            type="number"
            className={field}
            value={years}
            onChange={(e) => setYears(+e.target.value || 0)}
          />
        </div>
      </div>
      <div className="rounded-xl bg-cream p-5">
        <Row k="Monthly EMI" v={inr(emi)} strong />
        <Row k="Principal" v={inr(p)} />
        <Row k="Total interest" v={inr(interest)} />
        <Row k="Total payment" v={inr(total)} strong />
      </div>
    </div>
  );
}

/* ---------------- HRA ---------------- */
function HraCalc() {
  const [basic, setBasic] = useState(600000);
  const [hra, setHra] = useState(300000);
  const [rent, setRent] = useState(240000);
  const [metro, setMetro] = useState(true);

  const r1 = hra;
  const r2 = (metro ? 0.5 : 0.4) * basic;
  const r3 = Math.max(0, rent - 0.1 * basic);
  const exempt = Math.max(0, Math.min(r1, r2, r3));
  const taxable = Math.max(0, hra - exempt);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className={label}>Basic salary + DA (annual ₹)</label>
          <input
            type="number"
            className={field}
            value={basic}
            onChange={(e) => setBasic(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>HRA received (annual ₹)</label>
          <input
            type="number"
            className={field}
            value={hra}
            onChange={(e) => setHra(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>Rent paid (annual ₹)</label>
          <input
            type="number"
            className={field}
            value={rent}
            onChange={(e) => setRent(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>City</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMetro(true)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                metro ? "bg-teal text-white" : "border border-teal/15 text-teal"
              }`}
            >
              Metro
            </button>
            <button
              type="button"
              onClick={() => setMetro(false)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                !metro ? "bg-teal text-white" : "border border-teal/15 text-teal"
              }`}
            >
              Non-metro
            </button>
          </div>
        </div>
      </div>
      <div className="rounded-xl bg-cream p-5">
        <Row k="Actual HRA received" v={inr(r1)} />
        <Row k={`${metro ? "50%" : "40%"} of basic`} v={inr(r2)} />
        <Row k="Rent − 10% of basic" v={inr(r3)} />
        <Row k="HRA exempt" v={inr(exempt)} strong />
        <Row k="Taxable HRA" v={inr(taxable)} />
      </div>
    </div>
  );
}

/* ---------------- Income Tax (New Regime, indicative) ---------------- */
function taxNewRegime(income: number) {
  const slabs = [
    [400000, 0],
    [400000, 0.05],
    [400000, 0.1],
    [400000, 0.15],
    [400000, 0.2],
    [400000, 0.25],
    [Infinity, 0.3],
  ] as const;
  let remaining = income;
  let tax = 0;
  for (const [width, rate] of slabs) {
    if (remaining <= 0) break;
    const taxed = Math.min(remaining, width);
    tax += taxed * rate;
    remaining -= taxed;
  }
  return tax;
}

function IncomeTaxCalc() {
  const [income, setIncome] = useState(1200000);
  const [salaried, setSalaried] = useState(true);

  const stdDed = salaried ? 75000 : 0;
  const taxable = Math.max(0, income - stdDed);
  let tax = taxNewRegime(taxable);
  // Section 87A rebate: taxable income up to 12,00,000 → tax nil (capped at 60,000)
  if (taxable <= 1200000) tax = Math.max(0, tax - Math.min(60000, tax));
  const cess = tax * 0.04;
  const total = tax + cess;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className={label}>Gross annual income (₹)</label>
          <input
            type="number"
            className={field}
            value={income}
            onChange={(e) => setIncome(+e.target.value || 0)}
          />
        </div>
        <div>
          <label className={label}>Income type</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSalaried(true)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                salaried
                  ? "bg-teal text-white"
                  : "border border-teal/15 text-teal"
              }`}
            >
              Salaried
            </button>
            <button
              type="button"
              onClick={() => setSalaried(false)}
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                !salaried
                  ? "bg-teal text-white"
                  : "border border-teal/15 text-teal"
              }`}
            >
              Other
            </button>
          </div>
        </div>
        <p className="text-xs text-muted">
          New regime, FY 2025-26 (AY 2026-27). Indicative only — surcharge and
          specific deductions are not included.
        </p>
      </div>
      <div className="rounded-xl bg-cream p-5">
        <Row k="Standard deduction" v={inr(stdDed)} />
        <Row k="Taxable income" v={inr(taxable)} />
        <Row k="Income tax" v={inr(tax)} />
        <Row k="Health & education cess (4%)" v={inr(cess)} />
        <Row k="Total tax payable" v={inr(total)} strong />
      </div>
    </div>
  );
}

/* ---------------- Wrapper ---------------- */
const tabs = [
  { key: "gst", label: "GST", icon: TbReceiptTax, el: <GstCalc /> },
  { key: "emi", label: "EMI", icon: TbBuildingBank, el: <EmiCalc /> },
  { key: "hra", label: "HRA", icon: TbHomeDollar, el: <HraCalc /> },
  { key: "tax", label: "Income Tax", icon: TbReportMoney, el: <IncomeTaxCalc /> },
];

export default function Calculators() {
  const [tab, setTab] = useState("gst");
  const active = tabs.find((t) => t.key === tab)!;

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-teal text-white"
                  : "border border-teal/15 text-teal hover:bg-teal/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label} Calculator
            </button>
          );
        })}
      </div>
      <div className="mt-8">{active.el}</div>
    </div>
  );
}
