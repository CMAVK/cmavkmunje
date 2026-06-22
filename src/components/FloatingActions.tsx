"use client";

import { FaWhatsapp, FaPhone, FaEnvelope } from "react-icons/fa6";
import { site } from "@/lib/site";

const wa = "91" + site.contact.phones[0];

export default function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-4 z-50 flex flex-col gap-3">
      <a
        href={`https://wa.me/${wa}?text=${encodeURIComponent(
          "Hello, I'd like to enquire about your services."
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
      >
        <FaWhatsapp className="h-6 w-6" />
      </a>
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
