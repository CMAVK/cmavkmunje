"use client";

import { useState } from "react";
import { FaPlus, FaTrash, FaPrint } from "react-icons/fa6";

type Item = { desc: string; hsn: string; qty: number; rate: number };

const inWords = (n: number): string => {
  // Indian numbering, returns words for a non-negative integer.
  if (n === 0) return "Zero";
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const two = (x: number): string =>
    x < 20 ? a[x] : b[Math.floor(x / 10)] + (x % 10 ? " " + a[x % 10] : "");
  const three = (x: number): string =>
    (x >= 100 ? a[Math.floor(x / 100)] + " Hundred" + (x % 100 ? " " : "") : "") + (x % 100 ? two(x % 100) : "");
  let out = "";
  const crore = Math.floor(n / 10000000); n %= 10000000;
  const lakh = Math.floor(n / 100000); n %= 100000;
  const thousand = Math.floor(n / 1000); n %= 1000;
  if (crore) out += three(crore) + " Crore ";
  if (lakh) out += three(lakh) + " Lakh ";
  if (thousand) out += three(thousand) + " Thousand ";
  if (n) out += three(n);
  return out.trim();
};

const money = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GstInvoiceGenerator() {
  const [seller, setSeller] = useState({ name: "", gstin: "", address: "", state: "" });
  const [buyer, setBuyer] = useState({ name: "", gstin: "", address: "", state: "" });
  const [meta, setMeta] = useState({
    invoiceNo: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [items, setItems] = useState<Item[]>([{ desc: "", hsn: "", qty: 1, rate: 0 }]);
  const [gstRate, setGstRate] = useState(18);
  const [interState, setInterState] = useState(false);

  const taxable = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const taxAmt = (taxable * gstRate) / 100;
  const cgst = interState ? 0 : taxAmt / 2;
  const sgst = interState ? 0 : taxAmt / 2;
  const igst = interState ? taxAmt : 0;
  const grand = taxable + taxAmt;
  const rounded = Math.round(grand);

  function updateItem(idx: number, patch: Partial<Item>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-teal";

  return (
    <div className="space-y-8">
      {/* ---------------- FORM (hidden when printing) ---------------- */}
      <div className="no-print space-y-6 rounded-2xl border border-black/10 bg-white p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Seller */}
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-teal">Your Details (Seller)</h3>
            <input className={field} placeholder="Business name" value={seller.name} onChange={(e) => setSeller({ ...seller, name: e.target.value })} />
            <input className={field} placeholder="GSTIN" value={seller.gstin} onChange={(e) => setSeller({ ...seller, gstin: e.target.value.toUpperCase() })} />
            <input className={field} placeholder="Address" value={seller.address} onChange={(e) => setSeller({ ...seller, address: e.target.value })} />
            <input className={field} placeholder="State" value={seller.state} onChange={(e) => setSeller({ ...seller, state: e.target.value })} />
          </div>
          {/* Buyer */}
          <div className="space-y-2">
            <h3 className="font-display font-semibold text-teal">Customer Details (Buyer)</h3>
            <input className={field} placeholder="Customer name" value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} />
            <input className={field} placeholder="GSTIN (if registered)" value={buyer.gstin} onChange={(e) => setBuyer({ ...buyer, gstin: e.target.value.toUpperCase() })} />
            <input className={field} placeholder="Address" value={buyer.address} onChange={(e) => setBuyer({ ...buyer, address: e.target.value })} />
            <input className={field} placeholder="State" value={buyer.state} onChange={(e) => setBuyer({ ...buyer, state: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <input className={field} placeholder="Invoice No." value={meta.invoiceNo} onChange={(e) => setMeta({ ...meta, invoiceNo: e.target.value })} />
          <input className={field} type="date" value={meta.date} onChange={(e) => setMeta({ ...meta, date: e.target.value })} />
          <select className={field} value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))}>
            {[0, 5, 12, 18, 28].map((r) => <option key={r} value={r}>GST {r}%</option>)}
          </select>
          <select className={field} value={interState ? "inter" : "intra"} onChange={(e) => setInterState(e.target.value === "inter")}>
            <option value="intra">Same state (CGST+SGST)</option>
            <option value="inter">Other state (IGST)</option>
          </select>
        </div>

        {/* Items */}
        <div className="space-y-2">
          <h3 className="font-display font-semibold text-teal">Items</h3>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2">
              <input className={`${field} col-span-5`} placeholder="Description" value={it.desc} onChange={(e) => updateItem(idx, { desc: e.target.value })} />
              <input className={`${field} col-span-2`} placeholder="HSN/SAC" value={it.hsn} onChange={(e) => updateItem(idx, { hsn: e.target.value })} />
              <input className={`${field} col-span-2`} type="number" min={0} placeholder="Qty" value={it.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} />
              <input className={`${field} col-span-2`} type="number" min={0} placeholder="Rate" value={it.rate} onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })} />
              <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="col-span-1 flex items-center justify-center text-muted hover:text-red-500" aria-label="Remove item">
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button onClick={() => setItems([...items, { desc: "", hsn: "", qty: 1, rate: 0 }])} className="flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline">
            <FaPlus className="h-3.5 w-3.5" /> Add item
          </button>
        </div>

        <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white hover:scale-[1.01]">
          <FaPrint className="h-4 w-4" /> Print / Download PDF
        </button>
      </div>

      {/* ---------------- INVOICE PREVIEW (printable) ---------------- */}
      <div className="invoice-sheet rounded-2xl border border-black/15 bg-white p-6 text-ink sm:p-8">
        <div className="flex items-start justify-between border-b border-black/10 pb-4">
          <div>
            <h2 className="font-display text-2xl font-bold text-teal">TAX INVOICE</h2>
            <p className="text-xs text-muted">GST Compliant Invoice</p>
          </div>
          <div className="text-right text-sm">
            <p><span className="text-muted">Invoice No: </span><b>{meta.invoiceNo || "—"}</b></p>
            <p><span className="text-muted">Date: </span><b>{meta.date}</b></p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 text-sm">
          <div>
            <p className="mb-1 font-semibold text-teal">From</p>
            <p className="font-medium">{seller.name || "Your Business Name"}</p>
            <p className="text-muted">{seller.address}</p>
            {seller.state && <p className="text-muted">{seller.state}</p>}
            {seller.gstin && <p className="text-muted">GSTIN: {seller.gstin}</p>}
          </div>
          <div>
            <p className="mb-1 font-semibold text-teal">Bill To</p>
            <p className="font-medium">{buyer.name || "Customer Name"}</p>
            <p className="text-muted">{buyer.address}</p>
            {buyer.state && <p className="text-muted">{buyer.state}</p>}
            {buyer.gstin && <p className="text-muted">GSTIN: {buyer.gstin}</p>}
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-cream-deep text-left">
              <th className="border border-black/10 px-2 py-1.5">#</th>
              <th className="border border-black/10 px-2 py-1.5">Description</th>
              <th className="border border-black/10 px-2 py-1.5">HSN/SAC</th>
              <th className="border border-black/10 px-2 py-1.5 text-right">Qty</th>
              <th className="border border-black/10 px-2 py-1.5 text-right">Rate</th>
              <th className="border border-black/10 px-2 py-1.5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td className="border border-black/10 px-2 py-1.5">{i + 1}</td>
                <td className="border border-black/10 px-2 py-1.5">{it.desc || "—"}</td>
                <td className="border border-black/10 px-2 py-1.5">{it.hsn}</td>
                <td className="border border-black/10 px-2 py-1.5 text-right">{it.qty}</td>
                <td className="border border-black/10 px-2 py-1.5 text-right">{money(it.rate)}</td>
                <td className="border border-black/10 px-2 py-1.5 text-right">{money(it.qty * it.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-full max-w-xs space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted">Taxable Value</span><span>₹ {money(taxable)}</span></div>
            {interState ? (
              <div className="flex justify-between"><span className="text-muted">IGST @ {gstRate}%</span><span>₹ {money(igst)}</span></div>
            ) : (
              <>
                <div className="flex justify-between"><span className="text-muted">CGST @ {gstRate / 2}%</span><span>₹ {money(cgst)}</span></div>
                <div className="flex justify-between"><span className="text-muted">SGST @ {gstRate / 2}%</span><span>₹ {money(sgst)}</span></div>
              </>
            )}
            <div className="flex justify-between border-t border-black/10 pt-1 text-base font-bold text-teal">
              <span>Total</span><span>₹ {money(rounded)}</span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm"><span className="text-muted">Amount in words: </span><b>{inWords(rounded)} Rupees Only</b></p>

        <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-4 text-sm">
          <p className="max-w-xs text-xs text-muted">This is a computer-generated tax invoice. Please verify all details before issuing to your customer.</p>
          <div className="text-center">
            <div className="h-10" />
            <p className="border-t border-black/30 pt-1 font-medium">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
