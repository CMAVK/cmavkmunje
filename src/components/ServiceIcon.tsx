// Minimal line icons keyed by service slug.
const paths: Record<string, React.ReactNode> = {
  gst: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
    </>
  ),
  "income-tax": (
    <>
      <path d="M4 20h16M6 20V10M10 20V6M14 20v-8M18 20V8" strokeLinecap="round" />
    </>
  ),
  "tds-tcs": (
    <>
      <path d="M12 3v18" strokeLinecap="round" />
      <path d="M16 7c0-1.7-1.8-3-4-3s-4 1-4 2.6C8 11 16 9 16 13.5 16 16 14 17 12 17s-4-1.3-4-3" strokeLinecap="round" />
    </>
  ),
  "corporate-compliance": (
    <>
      <path d="M5 21V7l7-4 7 4v14" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6M9 10h.01M15 10h.01" strokeLinecap="round" />
    </>
  ),
  "project-finance": (
    <>
      <path d="M3 3v18h18" strokeLinecap="round" />
      <path d="M7 14l4-4 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "virtual-cfo": (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" strokeLinecap="round" />
    </>
  ),
  "cost-audit": (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </>
  ),
  registrations: (
    <>
      <path d="M14 3v5h5" strokeLinejoin="round" />
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinejoin="round" />
      <path d="M9 13l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export default function ServiceIcon({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={className}
      aria-hidden="true"
    >
      {paths[slug] ?? paths.gst}
    </svg>
  );
}
