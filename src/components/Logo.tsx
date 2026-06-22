// Firm emblem. To use your own logo image instead, drop the file at
// public/logo.png and replace this component's <svg> with:
//   <Image src="/logo.png" alt="V K Munje & Company" width={48} height={48} />
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="V K Munje & Company emblem"
    >
      <defs>
        <linearGradient id="vkm-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e3b457" />
          <stop offset="100%" stopColor="#c8932f" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#0b4f4a" />
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="url(#vkm-ring)"
        strokeWidth="1.5"
      />
      <text
        x="50"
        y="54"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="30"
        fontWeight="700"
        fill="url(#vkm-ring)"
        letterSpacing="1"
      >
        VKM
      </text>
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fill="#faf8f3"
        letterSpacing="2"
      >
        CMA
      </text>
    </svg>
  );
}
