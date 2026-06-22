import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${site.name} — Cost & Management Accountants in New Kalyani Nagar, Pune. Call, email or visit our office.`,
};

const waNumber = "91" + site.contact.phones[0];

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">
            Contact
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Let&apos;s start a conversation
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Tell us what you need and we&apos;ll get back to you promptly. For
            urgent matters, call or WhatsApp us directly.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          {/* Details */}
          <div className="space-y-8">
            <div>
              <div className="accent-rule mb-5" />
              <h2 className="font-display text-2xl font-bold text-teal">
                Reach us directly
              </h2>
            </div>

            <ContactItem label="Office">
              {site.contact.address}
            </ContactItem>

            <ContactItem label="Phone">
              {site.contact.phones.map((p, i) => (
                <span key={p} className="block">
                  <a href={`tel:+91${p}`} className="hover:text-teal">
                    +91 {p}
                  </a>
                  {i === 0 && " (primary)"}
                </span>
              ))}
            </ContactItem>

            <ContactItem label="Email">
              <a
                href={`mailto:${site.contact.email}`}
                className="hover:text-teal"
              >
                {site.contact.email}
              </a>
            </ContactItem>

            <ContactItem label="Working hours">{site.contact.hours}</ContactItem>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={`https://wa.me/${waNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                WhatsApp us
              </a>
              <a
                href={site.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-teal/30 px-5 py-2.5 text-sm font-semibold text-teal hover:bg-teal/5"
              >
                Get directions
              </a>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm">
              <iframe
                title="Office location map"
                src="https://maps.google.com/maps?q=New%20Kalyani%20Nagar%20Wadgaon%20Sheri%20Pune%20411014&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="h-64 w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          {/* Form */}
          <div className="rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
            <h2 className="font-display text-2xl font-bold text-teal">
              Send an enquiry
            </h2>
            <p className="mt-1 text-sm text-muted">
              We typically respond within one business day.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gold">
        {label}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-ink">{children}</div>
    </div>
  );
}
