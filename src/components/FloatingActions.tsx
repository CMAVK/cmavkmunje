"use client";

import { useState } from "react";
import { FaWhatsapp, FaPhone, FaEnvelope, FaXmark } from "react-icons/fa6";
import { site } from "@/lib/site";

const wa = "91" + site.contact.phones[0];

const waOptions = [
  { label: "GST Query", msg: "Hello, I have a GST query and need assistance." },
  { label: "Income Tax Query", msg: "Hello, I have an Income Tax query." },
  { label: "Labour Law Query", msg: "Hello, I need help with Labour Law / PF / ESIC." },
  { label: "Company Registration", msg: "Hello, I want to know about Company or LLP Registration." },
  { label: "Book Consultation", msg: "Hello, I'd like to book a consultation with CMA Vicky Munje." },
];

export default function FloatingActions() {
  const [waOpen, setWaOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3">
      {/* WhatsApp toggle button + leftward popup menu */}
      <div className="relative">
        {waOpen && (
          <div className="absolute bottom-0 right-14 w-56 rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
            <div className="flex items-center justify-between bg-[#25D366] px-4 py-2.5">
              <span className="text-sm font-semibold text-white">Chat on WhatsApp</span>
              <button onClick={() => setWaOpen(false)} aria-label="Close" className="text-white/80 hover:text-white">
                <FaXmark className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-col divide-y divide-black/5">
              {waOptions.map((opt) => (
                <a
                  key={opt.label}
                  href={`https://wa.me/${wa}?text=${encodeURIComponent(opt.msg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setWaOpen(false)}
                  className="px-4 py-2.5 text-sm text-ink hover:bg-[#25D366]/10 transition-colors"
                >
                  {opt.label}
                </a>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={() => setWaOpen((o) => !o)}
          aria-label="Chat on WhatsApp"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
        >
          <FaWhatsapp className="h-6 w-6" />
        </button>
      </div>

      <a
        href={`tel:+91${site.contact.phones[0]}`}
        aria-label="Call us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-teal text-white shadow-lg transition-transform hover:scale-110"
      >
        <FaPhone className="h-5 w-5" />
      </a>

      <a
        href={`mailto:${site.contact.email}`}
        aria-label="Email us"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-white shadow-lg transition-transform hover:scale-110"
      >
        <FaEnvelope className="h-5 w-5" />
      </a>
    </div>
  );
}
