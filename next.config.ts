import type { NextConfig } from "next";

// Baseline browser security headers for every page and API route.
// No full Content-Security-Policy yet (the site loads Supabase, Formspree and
// embeds that would need careful allow-listing) — frame-ancestors alone stops
// other sites from framing our pages for clickjacking.
const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    // Secure client request pages carry a secret token in the URL: never send
    // it onward as a Referer, never cache the page, never index it.
    const privatePage = [
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "Cache-Control", value: "no-store" },
      { key: "X-Robots-Tag", value: "noindex, nofollow" },
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/vkm", headers: privatePage },
      { source: "/vkm/:path*", headers: privatePage },
    ];
  },
};

export default nextConfig;
