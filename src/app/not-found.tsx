import Link from "next/link";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-24 text-center">
      <Logo className="h-14" />
      <p className="mt-6 font-display text-6xl font-bold text-teal">404</p>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">
        Page not found
      </h1>
      <p className="mt-3 text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s
        get you back on track.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
        >
          Back to home
        </Link>
        <Link
          href="/contact"
          className="rounded-full border border-teal/30 px-6 py-3 text-sm font-semibold text-teal hover:bg-teal/5"
        >
          Contact us
        </Link>
      </div>
    </section>
  );
}
