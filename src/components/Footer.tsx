import Link from "next/link";
import Logo from "./Logo";
import { nav, services, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-teal-dark text-cream/85">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Logo className="h-12 w-12" />
            <div>
              <p className="font-display text-lg font-bold text-white">
                {site.name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold-light">
                {site.profession}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm italic text-cream/70">
            “{site.tagline}”
          </p>
          <p className="mt-3 text-xs text-cream/50">
            Established {site.established}
          </p>
        </div>

        {/* Quick links */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-light">
            Explore
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-light">
            Reach Us
          </h3>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="text-cream/70">{site.contact.address}</p>
            <p>
              {site.contact.phones.map((p, i) => (
                <span key={p}>
                  <a href={`tel:+91${p}`} className="hover:text-white">
                    +91 {p}
                  </a>
                  {i < site.contact.phones.length - 1 && (
                    <span className="text-cream/40"> · </span>
                  )}
                </span>
              ))}
            </p>
            <p>
              <a
                href={`mailto:${site.contact.email}`}
                className="hover:text-white"
              >
                {site.contact.email}
              </a>
            </p>
            <p>
              <a
                href={site.contact.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold-light hover:text-white"
              >
                View on Google Maps →
              </a>
            </p>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>{site.founder.name} · {site.founder.credentials}</p>
        </div>
      </div>
    </footer>
  );
}
