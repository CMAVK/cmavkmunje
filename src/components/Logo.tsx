import { site } from "@/lib/site";

// The official iCMA emblem extracted from the firm's visiting card.
// Sizing is height-driven — pass a height class (e.g. "h-10"); width stays auto.
export default function Logo({ className = "h-10" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt={`${site.name} — iCMA`}
      className={`w-auto ${className}`}
    />
  );
}
