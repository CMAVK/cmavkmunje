import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingActions from "@/components/FloatingActions";
import { serviceCategories, site } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["500", "600", "700"],
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
    "V K Munje & Company — Cost & Management Accountants in Pune. GST, Income Tax, TDS, Cost Audit, ROC/MCA & FEMA compliance, Labour Law, Startup advisory, Project Finance and Virtual CFO services.",
  keywords: [
    "Cost Accountant Pune",
    "CMA Pune",
    "GST Consultant Pune",
    "Income Tax Consultant Pune",
    "ROC Consultant Pune",
    "LLP Registration Pune",
    "Labour Law Consultant Pune",
    "Startup Consultant Pune",
    "Cost Audit Pune",
    "Project Report Consultant Pune",
    "V K Munje & Company",
  ],
  openGraph: {
    title: `${site.name} | ${site.profession}`,
    description:
      "Expert GST, Income Tax, Cost Audit, Labour Law and Corporate Compliance services from a trusted CMA firm in Pune.",
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
    foundingDate: site.established,
    founders: [
      { "@type": "Person", name: site.founder.name },
      { "@type": "Person", name: site.partner.name },
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress:
        "Shop 2401, 24th Floor, Business Park, New Kalyani Nagar, Wadgaon Sheri",
      addressLocality: "Pune",
      postalCode: "411014",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
    areaServed: "IN",
    knowsAbout: serviceCategories.map((s) => s.title),
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <FloatingActions />
      </body>
    </html>
  );
}
