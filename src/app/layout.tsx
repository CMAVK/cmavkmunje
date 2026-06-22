import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | ${site.profession} in Pune`,
    template: `%s | ${site.name}`,
  },
  description:
    "V K Munje & Company is a firm of Cost & Management Accountants in Pune offering GST, income tax, TDS, ROC/MCA compliance, project finance, CMA data and Virtual CFO services.",
  keywords: [
    "Cost Accountant Pune",
    "CMA Pune",
    "GST consultant Pune",
    "income tax filing Pune",
    "project report CMA data",
    "Virtual CFO",
    "V K Munje & Company",
  ],
  openGraph: {
    title: `${site.name} | ${site.profession}`,
    description:
      "GST, income tax, TDS, corporate compliance, project finance and Virtual CFO services from a trusted CMA firm in Pune.",
    url: site.url,
    siteName: site.name,
    locale: "en_IN",
    type: "website",
  },
  alternates: { canonical: site.url },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AccountingService",
    name: site.name,
    description: `${site.profession} in Pune — taxation, compliance and financial advisory.`,
    url: site.url,
    email: site.contact.email,
    telephone: `+91${site.contact.phones[0]}`,
    founder: {
      "@type": "Person",
      name: site.founder.name,
    },
    foundingDate: site.established,
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Office No. 2401, 24th Floor, Business Park, Near Bramha Suncity, New Kalyani Nagar, Wadgaon Sheri",
      addressLocality: "Pune",
      postalCode: "411014",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: "Pune, Maharashtra",
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
