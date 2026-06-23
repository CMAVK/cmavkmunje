// Central data for the whole site. Edit here to update content everywhere.

export const site = {
  name: "V K MUNJE & COMPANY",
  shortName: "VKM & CO.",
  profession: "Cost Accountants",
  tagline: "Your Trusted Partner for Taxation, Compliance & Business Growth",
  motto: "Behind every successful business decision, there is always a CMA.",
  established: "2019",
  founder: {
    name: "CMA Vicky Munje",
    credentials: "ACMA, LLB, M.Com",
    role: "Founder & Principal",
  },
  partner: {
    name: "CA Deepak Mehta",
    credentials: "ACA",
    role: "Associate Professional",
  },
  contact: {
    phones: ["9922099970", "9657375713"],
    email: "cma.vickymunje@gmail.com",
    address:
      "Shop 2401, 24th Floor, Business Park, New Kalyani Nagar, Wadgaon Sheri, Pune – 411014",
    addressShort: "New Kalyani Nagar, Pune – 411014",
    mapsUrl: "https://maps.app.goo.gl/xBkpWCRgakxoJA8u8",
    hours: "Mon – Sat · 10:00 AM – 7:00 PM",
  },
  url: "https://cmavkmunje.com",
};

// ── Maintenance: review these dated items whenever the law changes ──
// Update `lastReviewed` after any review so the site shows an honest date.
export const lastReviewed = "June 2026";

export const disclaimer = `Tax rates, thresholds, due dates, forms and statutory provisions on this website (under the Income-tax Act 2025, the CGST/SGST Acts, the Companies Act 2013 and allied laws) are for general guidance and current as of ${lastReviewed}. Such laws, their amendments, rates and forms change frequently — please confirm the latest position with us before acting.`;

export const nav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Industries", href: "/industries" },
  { label: "Resources", href: "/resources" },
  { label: "Tools", href: "/tools" },
  { label: "FAQs", href: "/faq" },
  { label: "Reviews", href: "/feedback" },
  { label: "Book", href: "/book" },
  { label: "Contact", href: "/contact" },
];

// Client-portal links (shown in footer / used where relevant).
export const clientNav: { label: string; href: string }[] = [
  { label: "Upload Documents", href: "/upload" },
  { label: "Client Login", href: "/login" },
  { label: "Leave a Review", href: "/feedback" },
];

// All routes for the sitemap.
export const routes = [
  "/",
  "/about",
  "/services",
  "/industries",
  "/resources",
  "/tools",
  "/faq",
  "/blog",
  "/downloads",
  "/book",
  "/upload",
  "/feedback",
  "/login",
  "/contact",
];

export type ServiceCategory = {
  slug: string;
  title: string;
  icon: string; // react-icons key handled in ServiceIcon
  short: string;
  items: string[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "gst",
    title: "GST & Indirect Tax",
    icon: "gst",
    short:
      "End-to-end Goods & Services Tax support — from registration to litigation.",
    items: [
      "GST Registration",
      "GST Return Filing (GSTR-1, 3B, 9, 9C)",
      "GST Audit & Reconciliation",
      "GST Notice Replies",
      "GST Litigation & Appeals",
      "Input Tax Credit (ITC) Reconciliation",
      "E-Way Bill",
      "E-Invoicing",
      "GST Advisory & Health Check",
    ],
  },
  {
    slug: "income-tax",
    title: "Income Tax Services",
    icon: "tax",
    short:
      "Return filing, planning and representation for every type of assessee.",
    items: [
      "Income Tax Return (ITR) Filing",
      "Tax Planning & Advisory",
      "Tax Audit (3CA/3CB-3CD)",
      "Income Tax Notices & Scrutiny",
      "Assessment & Appeals",
      "Representation before Authorities",
      "NRI Taxation & DTAA",
    ],
  },
  {
    slug: "tds-tcs",
    title: "TDS & TCS Services",
    icon: "tds",
    short:
      "Accurate deduction, timely returns and resolution of every TDS default.",
    items: [
      "TDS / TCS Return Filing",
      "Form 16 / 16A Issuance",
      "Form 24Q & 26Q",
      "TDS Notices & Defaults",
      "Lower / Nil Deduction Certificates",
      "TDS Advisory",
    ],
  },
  {
    slug: "accounting",
    title: "Accounting & Bookkeeping",
    icon: "accounting",
    short:
      "Reliable books and CFO-grade reporting so you always know your numbers.",
    items: [
      "Bookkeeping & Accounting",
      "Accounting Outsourcing",
      "Payroll Processing",
      "MIS Reporting",
      "Virtual CFO Services",
    ],
  },
  {
    slug: "cost-management",
    title: "Cost Management",
    icon: "cost",
    short:
      "Our core CMA strength — controlling costs and improving profitability.",
    items: [
      "Cost Audit",
      "Maintenance of Cost Records",
      "Budgeting & Forecasting",
      "Cost Reduction",
      "Pricing Analysis",
      "Profitability Analysis",
    ],
  },
  {
    slug: "corporate-compliance",
    title: "Corporate Compliance (ROC/MCA)",
    icon: "company",
    short:
      "Incorporation and ongoing secretarial compliance for companies & LLPs.",
    items: [
      "Private Limited Company",
      "LLP Registration",
      "One Person Company (OPC)",
      "Section 8 Company",
      "Annual ROC Filing",
      "Board Resolutions",
      "Secretarial Compliance",
    ],
  },
  {
    slug: "fema",
    title: "FEMA & RBI Compliance",
    icon: "fema",
    short:
      "Cross-border investment and exchange-control reporting, done right.",
    items: [
      "Foreign Direct Investment (FDI)",
      "Overseas Direct Investment (ODI)",
      "External Commercial Borrowings (ECB)",
      "FEMA Advisory & Reporting",
    ],
  },
  {
    slug: "labour-law",
    title: "Labour Law Compliance",
    icon: "labour",
    short:
      "A dedicated division for PF, ESIC, PT and the full labour-law lifecycle.",
    items: [
      "PF Registration, Returns & Notices",
      "ESIC Registration & Returns",
      "Professional Tax (PT)",
      "Labour Welfare Fund",
      "Shop & Establishment Registration",
      "Payroll & Factory Act Compliance",
      "CLRA / Contract Labour Compliance",
      "Labour Audit & Litigation",
    ],
  },
  {
    slug: "startup",
    title: "Startup Advisory",
    icon: "startup",
    short:
      "Getting new ventures registered, funded and compliant from day one.",
    items: [
      "Startup India & DPIIT",
      "Udyam / MSME Registration",
      "Business Plans",
      "Financial Projections",
      "Investor Pitch Support",
    ],
  },
  {
    slug: "project-finance",
    title: "Project Finance & Valuation",
    icon: "finance",
    short:
      "Bankable reports and independent valuations to unlock capital.",
    items: [
      "Bank Project Reports / DPR",
      "CMA Data",
      "Loan Proposals",
      "TEV Studies",
      "Business & Startup Valuation",
    ],
  },
  {
    slug: "litigation",
    title: "Notice & Litigation Management",
    icon: "litigation",
    short:
      "A single desk to handle every notice, assessment and representation.",
    items: [
      "GST & Income Tax Notices",
      "PF / ESIC / Labour Notices",
      "ROC Notices",
      "Assessment Proceedings",
      "Appeals & Representation",
    ],
  },
];

export type Industry = { slug: string; name: string; icon: string; note: string };

export const industries: Industry[] = [
  { slug: "manufacturing", name: "Manufacturing", icon: "factory", note: "Cost records, cost audit, GST and inventory-driven compliance." },
  { slug: "construction", name: "Construction", icon: "construction", note: "Works-contract GST, labour-law and project-finance support." },
  { slug: "real-estate", name: "Real Estate", icon: "building", note: "RERA-aware structuring, GST on under-construction sales." },
  { slug: "trading", name: "Trading & Distribution", icon: "trade", note: "GST, e-way bills, stock and margin analysis." },
  { slug: "startups", name: "Startups", icon: "rocket", note: "DPIIT, funding readiness, projections and lean compliance." },
  { slug: "it", name: "IT & Software", icon: "code", note: "Export/LUT, transfer pricing basics, ESOP and payroll." },
  { slug: "healthcare", name: "Healthcare", icon: "health", note: "Sector-specific GST exemptions and entity structuring." },
  { slug: "education", name: "Education", icon: "education", note: "Trust/Section 8 compliance and exemption management." },
  { slug: "ngo", name: "NGOs & Trusts", icon: "ngo", note: "12A/80G, FCRA-readiness and statutory compliance." },
  { slug: "logistics", name: "Logistics & Transport", icon: "truck", note: "GST on transport, RCM and fleet cost management." },
];

export const trustPoints = [
  { title: "Registered with ICMAI", note: "A practising firm of Cost & Management Accountants." },
  { title: "Established in 2019", note: "Years of hands-on advisory across sectors." },
  { title: "Professional Ethics & Confidentiality", note: "Your information is handled with strict confidentiality." },
  { title: "Multi-Disciplinary Practice", note: "CMA and CA expertise under one roof." },
  { title: "PAN-India Service Capability", note: "Serving clients across India, online and on-site." },
  { title: "Dedicated Point of Contact", note: "A consistent relationship for every engagement." },
];

export const whyChooseUs = [
  { title: "Expert CMA-led advisory", note: "Guidance rooted in cost and management accounting, not just filing." },
  { title: "Single-window compliance", note: "Tax, ROC, FEMA and labour law handled together." },
  { title: "Practical business approach", note: "Advice you can actually act on, in plain language." },
  { title: "Technology-driven reporting", note: "Clear, timely reporting and reminders." },
  { title: "Dedicated compliance tracking", note: "We watch your deadlines so you don't have to." },
  { title: "Strong litigation support", note: "Confident representation when notices arrive." },
];

export const coreValues = [
  { title: "Integrity", note: "Honest counsel on every engagement." },
  { title: "Transparency", note: "Clear scope, timelines and communication." },
  { title: "Professionalism", note: "Rigour and discipline in everything we file." },
  { title: "Client Satisfaction", note: "Your outcomes are the measure of our work." },
  { title: "Continuous Improvement", note: "We keep learning as the law evolves." },
];

export const timeline = [
  { year: "2019", text: "V K Munje & Company is founded in Pune as a practising CMA firm." },
  { year: "2021", text: "Expanded into corporate compliance, ROC and FEMA advisory." },
  { year: "2023", text: "Launched a dedicated Labour Law compliance division (PF, ESIC, PT)." },
  { year: "Today", text: "A multi-disciplinary advisory practice serving clients across India." },
];

export type Faq = { q: string; a: string; cat: string };

export const faqCategories = [
  "GST",
  "Income Tax",
  "TDS",
  "ROC & Company",
  "LLP",
  "Startup",
  "Labour Law",
];

export const faqs: Faq[] = [
  // GST
  { cat: "GST", q: "Who needs to register for GST?", a: "Generally, businesses with aggregate turnover above ₹40 lakh for goods (₹20 lakh for services, lower in special-category states) must register. Inter-state suppliers, e-commerce sellers and those under reverse charge may need to register regardless of turnover." },
  { cat: "GST", q: "What is the due date for GSTR-3B?", a: "GSTR-3B is generally due by the 20th of the following month for monthly filers; staggered dates of 22nd/24th apply to QRMP taxpayers depending on the state." },
  { cat: "GST", q: "Can I claim Input Tax Credit on all purchases?", a: "ITC is available only on goods and services used in the course of business and is subject to conditions in Section 16 and blocked credits in Section 17(5). It must also reflect in your GSTR-2B." },
  { cat: "GST", q: "What happens if I receive a GST notice?", a: "Do not ignore it. Notices have strict reply timelines. We review the notice, prepare a reasoned response with supporting documents, and represent you before the department." },
  { cat: "GST", q: "Is e-invoicing mandatory for my business?", a: "E-invoicing applies to businesses above a notified turnover threshold (currently ₹5 crore). We help you assess applicability and set up compliant invoicing." },
  { cat: "GST", q: "What is GSTR-9 and 9C?", a: "GSTR-9 is the annual return; GSTR-9C is a reconciliation statement required for taxpayers above the notified turnover. Both consolidate your year's GST data." },
  { cat: "GST", q: "How is GST handled on exports?", a: "Exports are zero-rated. You can export under a Letter of Undertaking (LUT) without paying IGST, or pay IGST and claim a refund. We manage LUTs and refund applications." },
  // Income Tax
  { cat: "Income Tax", q: "Which ITR form should I file?", a: "It depends on your income sources and assessee type — ITR-1 for simple salaried income, up to ITR-7 for trusts. We determine the correct form for your situation." },
  { cat: "Income Tax", q: "Should I choose the old or new tax regime?", a: "It depends on your deductions and investments. The new regime offers lower slab rates with fewer deductions. We run both computations and recommend the one that minimises your tax." },
  { cat: "Income Tax", q: "When is a tax audit required?", a: "Broadly, when business turnover exceeds ₹1 crore (₹10 crore if cash transactions are within 5%) or professional receipts exceed ₹75 lakh, subject to presumptive-taxation conditions." },
  { cat: "Income Tax", q: "What is the due date to file my ITR?", a: "Usually 31st July for non-audit cases and 31st October for audit cases, unless extended. Belated and revised returns have their own timelines." },
  { cat: "Income Tax", q: "I received a notice under Section 143 or 148. What now?", a: "These relate to assessment or reassessment. Timelines matter. We analyse the basis, compile your records and respond or represent you in the proceedings." },
  { cat: "Income Tax", q: "Can you help with capital gains tax?", a: "Yes — on property, shares, mutual funds and more, including exemptions under sections like 54 and 54F and set-off of losses." },
  { cat: "Income Tax", q: "Do NRIs need to file returns in India?", a: "NRIs must file if they have taxable Indian income above the basic exemption or wish to claim a refund. We also advise on DTAA relief." },
  // TDS
  { cat: "TDS", q: "What is the due date to deposit TDS?", a: "TDS is generally deposited by the 7th of the following month (with a special date for March). Late deposit attracts interest." },
  { cat: "TDS", q: "Which TDS returns do I need to file?", a: "Form 24Q for salaries and 26Q for other resident payments, filed quarterly; 27Q for payments to non-residents." },
  { cat: "TDS", q: "What is Form 16 and when is it issued?", a: "Form 16 is the salary TDS certificate issued to employees, generally by 15th June after the financial year. Form 16A covers non-salary TDS." },
  { cat: "TDS", q: "What if I deducted TDS at the wrong rate?", a: "Short or non-deduction triggers interest and possible disallowance. We help correct returns, deposit shortfalls and respond to defaults on TRACES." },
  { cat: "TDS", q: "Can I get a lower TDS deduction certificate?", a: "Yes. If your actual tax liability is lower than the TDS rate, we can apply for a lower or nil deduction certificate under Section 197." },
  // ROC & Company
  { cat: "ROC & Company", q: "What are the annual compliances for a Private Limited company?", a: "These include filing AOC-4 (financials), MGT-7/7A (annual return), holding board and AGM meetings, DIR-3 KYC for directors and maintaining statutory registers." },
  { cat: "ROC & Company", q: "How long does company incorporation take?", a: "Typically 7–15 working days after documents and approvals, through the MCA SPICe+ process. We handle name approval, DSC, DIN and filing end to end." },
  { cat: "ROC & Company", q: "What is DIR-3 KYC?", a: "An annual KYC every director with a DIN must complete, usually by 30th September. Missing it deactivates the DIN and attracts a penalty." },
  { cat: "ROC & Company", q: "What happens if ROC filings are missed?", a: "Late filings attract per-day additional fees and can lead to director disqualification or company strike-off. We help regularise overdue filings." },
  // LLP
  { cat: "LLP", q: "What annual filings does an LLP need?", a: "Form 11 (annual return) by 30th May and Form 8 (statement of accounts & solvency) by 30th October, plus income-tax return filing." },
  { cat: "LLP", q: "Is audit mandatory for an LLP?", a: "Audit is required only if turnover exceeds ₹40 lakh or contribution exceeds ₹25 lakh; otherwise it is optional." },
  { cat: "LLP", q: "Can a Private Limited company be converted to an LLP, or vice versa?", a: "Yes, conversions are possible subject to conditions. We advise on the tax and compliance implications before you decide." },
  // Startup
  { cat: "Startup", q: "What is DPIIT / Startup India recognition?", a: "It is government recognition that unlocks benefits like tax exemptions, easier compliance and funding access. We assess eligibility and file the application." },
  { cat: "Startup", q: "What is Udyam (MSME) registration?", a: "A free government registration that classifies your business as micro, small or medium and enables MSME benefits, subsidies and faster payments protection." },
  { cat: "Startup", q: "Do you prepare business plans and projections?", a: "Yes — investor-ready business plans, financial projections and pitch support, grounded in realistic numbers." },
  { cat: "Startup", q: "Can a startup claim an 80-IAC tax holiday?", a: "Eligible DPIIT-recognised startups can claim a profit-linked deduction for three consecutive years out of ten, subject to conditions. We check eligibility and file the application." },
  // Labour Law
  { cat: "Labour Law", q: "When is PF registration mandatory?", a: "Generally when an establishment employs 20 or more persons; voluntary registration is also possible. We handle registration and monthly ECR filings." },
  { cat: "Labour Law", q: "When is ESIC registration required?", a: "Usually when 10 or more employees are engaged and wages are within the notified ESI limit. We manage registration, returns and inspections." },
  { cat: "Labour Law", q: "What is Professional Tax (PT)?", a: "A state-level tax on professions and employment. Employers must register, deduct from salaries and remit PT, with periodic returns." },
  { cat: "Labour Law", q: "What is a Shop & Establishment registration?", a: "A state registration required for most commercial establishments, often needed to open a current account and prove business existence." },
  { cat: "Labour Law", q: "We received a PF/ESIC notice — can you help?", a: "Yes. Our labour-law division handles assessments and notices under PF and ESI, prepares replies and represents you before the authorities." },
  { cat: "Labour Law", q: "What is CLRA / contract-labour compliance?", a: "The Contract Labour (Regulation & Abolition) Act requires licensing and registers where contract labour is engaged. We set up and maintain the required compliance." },
];

// Recurring statutory due dates — review/update when the law changes.
export const dueDates = [
  { date: "11th monthly", task: "GSTR-1 (monthly filers)", cat: "GST" },
  { date: "20th monthly", task: "GSTR-3B & tax payment", cat: "GST" },
  { date: "7th monthly", task: "TDS / TCS deposit", cat: "TDS" },
  { date: "15 Jun / Sep / Dec / Mar", task: "Advance tax instalments", cat: "Income Tax" },
  { date: "30th April", task: "PF / ESI annual returns review", cat: "Labour" },
  { date: "30th May", task: "LLP Form 11 (annual return)", cat: "ROC" },
  { date: "31st July", task: "ITR — non-audit cases", cat: "Income Tax" },
  { date: "30th September", task: "DIR-3 KYC for directors", cat: "ROC" },
  { date: "31st October", task: "ITR & tax audit — audit cases", cat: "Income Tax" },
  { date: "30th October", task: "LLP Form 8 (accounts & solvency)", cat: "ROC" },
  { date: "30th November", task: "Form MGT-7 / annual ROC filings", cat: "ROC" },
  { date: "31st December", task: "GSTR-9 & 9C (annual)", cat: "GST" },
];

export const calendars = [
  "GST Compliance Calendar",
  "Income Tax Calendar",
  "ROC Compliance Calendar",
  "Labour Law Compliance Calendar",
];

export const updates = [
  { tag: "GST", title: "Keep your GSTR-2B and books reconciled monthly", note: "Mismatches are the leading trigger for ITC notices — a monthly reconciliation keeps claims clean." },
  { tag: "Income Tax", title: "Plan your regime before the year ends, not at filing", note: "Choosing old vs new regime early lets you align investments and TDS." },
  { tag: "ROC", title: "Diarise DIR-3 KYC and annual filings", note: "Per-day late fees add up quickly; a compliance calendar avoids penalties." },
  { tag: "Labour Law", title: "Verify PF/ESI wage definitions after pay revisions", note: "Wage restructuring can change contribution liability — review periodically." },
];

export type Post = {
  slug: string;
  title: string;
  cat: string;
  date: string;
  excerpt: string;
  body: string[];
};

// Knowledge Centre articles — informational, ICMAI-compliant. Add new posts here.
export const posts: Post[] = [
  {
    slug: "old-vs-new-tax-regime",
    title: "Old vs New Tax Regime: How to Decide",
    cat: "Income Tax",
    date: "2026-06-10",
    excerpt:
      "A simple framework to choose between the old and new regimes based on your income, deductions and investments.",
    body: [
      "The new tax regime offers lower slab rates but withdraws most deductions and exemptions, while the old regime retains them. The right choice depends entirely on your individual numbers.",
      "As a rule of thumb, if you claim substantial deductions — such as 80C investments, home-loan interest, HRA and 80D — the old regime may still work out cheaper. If your deductions are modest, the new regime's lower rates usually win.",
      "The only reliable way to decide is to compute tax both ways for your actual figures. We run both computations for our clients each year and recommend the regime that minimises tax, while keeping your investment goals in mind.",
      "Remember that the regime can generally be chosen at the time of filing for individuals without business income, so there is flexibility year to year. Plan early so your TDS and advance tax align with your choice.",
    ],
  },
  {
    slug: "gst-itc-common-mistakes",
    title: "Input Tax Credit: Five Common Mistakes to Avoid",
    cat: "GST",
    date: "2026-05-22",
    excerpt:
      "ITC mismatches are a leading cause of GST notices. Here are the errors we see most — and how to prevent them.",
    body: [
      "Input Tax Credit is valuable, but it is also one of the most scrutinised areas under GST. A few avoidable mistakes account for most disputes.",
      "First, claiming credit that does not appear in your GSTR-2B. Credit must be reflected by your supplier — reconcile monthly. Second, claiming blocked credits under Section 17(5), such as on motor vehicles or personal expenses.",
      "Third, missing the time limit to claim credit for an invoice. Fourth, not reversing credit where payment to the supplier is not made within 180 days. Fifth, poor documentation — every claim should be backed by a valid tax invoice.",
      "A disciplined monthly reconciliation of books, GSTR-2B and supplier filings keeps your claims clean and notice-proof. We set up and run this process for clients so nothing slips.",
    ],
  },
  {
    slug: "private-limited-annual-compliance",
    title: "Annual Compliance Calendar for a Private Limited Company",
    cat: "ROC & MCA",
    date: "2026-05-05",
    excerpt:
      "The key MCA filings and meetings every private company must complete each year to stay compliant.",
    body: [
      "A private limited company has recurring obligations under the Companies Act 2013, and missing them attracts per-day penalties and director disqualification.",
      "Core annual items include holding board meetings and the AGM, filing AOC-4 (financial statements) and MGT-7/7A (annual return), completing DIR-3 KYC for every director, and maintaining statutory registers.",
      "Event-based filings — for changes in directors, capital, registered office or charges — carry their own timelines and should not wait for year-end.",
      "We maintain a compliance calendar for each company we serve, with reminders ahead of every due date, so filings are never missed and records stay inspection-ready.",
    ],
  },
  {
    slug: "what-bankers-want-project-report",
    title: "What Your Banker Looks For in a Project Report",
    cat: "Finance",
    date: "2026-04-18",
    excerpt:
      "The DSCR, projections and CMA-data essentials that get term loans and working-capital limits sanctioned faster.",
    body: [
      "A well-prepared project report is often the difference between a quick sanction and a stalled application. Bankers look for realism, not optimism.",
      "Key elements include credible revenue projections, a healthy and justifiable Debt Service Coverage Ratio (DSCR), accurate working-capital assessment, and sensitivity to downside scenarios.",
      "For working-capital limits, CMA data prepared on the prescribed format — with consistent assumptions across the operating cycle — builds banker confidence.",
      "We prepare bankable project reports and CMA data grounded in your actual financials and industry benchmarks, and support you through the sanction process.",
    ],
  },
];

export type Download = {
  file: string;
  title: string;
  cat: string;
  desc: string;
};

// Downloadable checklists (PDFs generated into /public/downloads).
export const downloads: Download[] = [
  { file: "gst-compliance-checklist.pdf", title: "GST Compliance Checklist", cat: "GST", desc: "Monthly and annual GST tasks, from returns to ITC reconciliation." },
  { file: "income-tax-checklist.pdf", title: "Income Tax Filing Checklist", cat: "Income Tax", desc: "Documents and steps for a smooth, accurate ITR filing." },
  { file: "roc-compliance-checklist.pdf", title: "ROC Compliance Checklist", cat: "ROC & MCA", desc: "Annual and event-based filings for companies and LLPs." },
  { file: "startup-setup-checklist.pdf", title: "Startup Setup Checklist", cat: "Startup", desc: "Registrations and compliances to launch your venture right." },
];
