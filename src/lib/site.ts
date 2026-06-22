// Central place for all firm details — edit here to update the whole site.

export const site = {
  name: "V K Munje & Company",
  shortName: "VKM & Co.",
  profession: "Cost & Management Accountants",
  tagline:
    "Behind every successful business decision, there is always a CMA.",
  established: "2019",
  founder: {
    name: "CMA Vicky Munje",
    credentials: "ACMA, LLB, M.Com",
  },
  contact: {
    phones: ["9922099970", "9657375713"],
    email: "cma.vickymunje@gmail.com",
    address:
      "Office No. 2401, 24th Floor, Business Park, Near Bramha Suncity, New Kalyani Nagar, Wadgaon Sheri, Pune – 411014",
    addressShort: "New Kalyani Nagar, Pune – 411014",
    mapsUrl: "https://maps.app.goo.gl/xBkpWCRgakxoJA8u8",
  },
  url: "https://cmavkmunje.in",
};

export const nav = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Resources", href: "/resources" },
  { label: "Contact", href: "/contact" },
];

export type Service = {
  slug: string;
  title: string;
  short: string;
  points: string[];
};

export const services: Service[] = [
  {
    slug: "gst",
    title: "GST Advisory & Compliance",
    short:
      "End-to-end GST — registration, returns, rate & HSN classification, ITC, RCM, refunds and litigation support.",
    points: [
      "Registration, amendments & cancellation",
      "GSTR-1, 3B, 9 & 9C filing",
      "ITC reconciliation & RCM advisory",
      "Refunds, exports & LUT",
      "Notices, demands & appeals",
    ],
  },
  {
    slug: "income-tax",
    title: "Income Tax & ITR",
    short:
      "Return filing and tax planning for individuals, firms, LLPs, companies, trusts and NRIs — old vs new regime optimisation.",
    points: [
      "ITR-1 to ITR-7 filing",
      "Old vs new regime planning",
      "Capital gains & presumptive taxation",
      "Tax audit (3CA/3CB-3CD)",
      "Scrutiny, 143(1), 148 & appeals",
    ],
  },
  {
    slug: "tds-tcs",
    title: "TDS / TCS",
    short:
      "Correct section, rate and threshold determination, deposits, quarterly returns and default resolution.",
    points: [
      "TDS/TCS computation & deposit",
      "24Q / 26Q / 27Q returns",
      "Form 16 / 16A issuance",
      "Lower / nil deduction certificates",
      "Default, interest & late-fee resolution",
    ],
  },
  {
    slug: "corporate-compliance",
    title: "ROC / MCA & Corporate Compliance",
    short:
      "Company & LLP incorporation, annual filings, event-based compliance, secretarial support and FEMA reporting.",
    points: [
      "Company / LLP incorporation",
      "AOC-4, MGT-7, DIR-3 KYC, DPT-3",
      "Charges, deposits & resolutions",
      "Strike-off & condonation",
      "FDI/ODI & FEMA reporting",
    ],
  },
  {
    slug: "project-finance",
    title: "Project Finance & CMA Data",
    short:
      "Bankable project reports, CMA data, working-capital assessment and government-scheme funding.",
    points: [
      "Project reports / DPR",
      "CMA data & MPBF (Nayak method)",
      "Term loan & cash-credit proposals",
      "Mudra, PMEGP, CGTMSE, Stand-Up India",
      "DSCR, projections & feasibility",
    ],
  },
  {
    slug: "virtual-cfo",
    title: "Virtual CFO & Business Advisory",
    short:
      "MIS, budgeting, cash-flow management and KPI dashboards — CFO-grade insight without the full-time cost.",
    points: [
      "MIS & management reporting",
      "Budgeting & forecasting",
      "Cash-flow & working-capital control",
      "KPI dashboards & cost control",
      "Business valuation & restructuring",
    ],
  },
  {
    slug: "cost-audit",
    title: "Cost & Management Audit",
    short:
      "Cost records, cost audit, internal audit and management audit to strengthen controls and profitability.",
    points: [
      "Cost records & cost audit",
      "Internal & management audit",
      "Cost reduction & control systems",
      "Inventory & process review",
      "Profitability analysis",
    ],
  },
  {
    slug: "registrations",
    title: "Registrations & Start-up Advisory",
    short:
      "MSME/Udyam, Startup India/DPIIT, RERA and other registrations to get your venture compliant from day one.",
    points: [
      "Udyam / MSME registration",
      "Startup India & DPIIT (80-IAC)",
      "MahaRERA registration & QPR",
      "PAN, TAN & professional tax",
      "Import-export code (IEC)",
    ],
  },
];
