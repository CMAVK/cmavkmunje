import Link from "next/link";
import Logo from "./Logo";
import Newsletter from "./Newsletter";
import { lastReviewed, nav, serviceCategories, site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="mt-auto bg-teal-dark text-cream/85">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-lg bg-white px-2 py-1.5">
              <Logo className="h-8" />
            </span>
            <div>
              <p className="font-display text-lg font-bold text-white">
                {site.name}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gold-light">
                {site.profession}
              </p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-cream/70">{site.tagline}</p>
          <p className="mt-3 text-xs text-cream/50">
            Established {site.established} · Registered with ICMAI
          </p>
          <div className="mt-5 max-w-xs">
            <p className="text-sm font-medium text-white">
              Compliance updates in your inbox
            </p>
            <div className="mt-2">
              <Newsletter />
            </div>
          </div>
        </div>

        {/* Explore */}
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
            <li>
              <Link href="/blog" className="hover:text-white">
                Knowledge Centre
              </Link>
            </li>
            <li>
              <Link href="/downloads" className="hover:text-white">
                Downloads
              </Link>
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-gold-light">
            Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm">
            {serviceCategories.slice(0, 7).map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="hover:text-white">
                  {s.title}
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
              <a href={`mailto:${site.contact.email}`} className="hover:text-white">
                {site.contact.email}
              </a>
            </p>
            <p className="text-cream/60">{site.contact.hours}</p>
          </address>
        </div>
      </div>

      {/* Authority statement */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-6 text-center text-xs leading-relaxed text-cream/55">
          {site.name} is a professionally managed firm of Cost &amp; Management
          Accountants providing GST, Income Tax, Cost Audit, Labour Law,
          Corporate Compliance, Startup Advisory, Project Finance and Management
          Consultancy services across India. Information on this site is for
          general guidance and current as of {lastReviewed}; tax &amp; corporate
          laws change frequently — please confirm with us before acting.
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-cream/50 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>
            {site.founder.name}, {site.founder.credentials} ·{" "}
            {site.partner.name}, {site.partner.credentials}
          </p>
        </div>
      </div>
    </footer>
  );
}
