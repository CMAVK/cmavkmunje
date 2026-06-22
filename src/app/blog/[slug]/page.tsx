import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TbArrowLeft } from "react-icons/tb";
import { disclaimer, posts, site } from "@/lib/site";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) return { title: "Article not found" };
  return { title: post.title, description: post.excerpt };
}

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <article className="mx-auto max-w-3xl px-5 py-16">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gold hover:text-teal"
        >
          <TbArrowLeft className="h-4 w-4" /> All articles
        </Link>

        <div className="mt-6 flex items-center gap-2">
          <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal">
            {post.cat}
          </span>
          <span className="text-xs text-muted">{fmt(post.date)}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-teal sm:text-4xl">
          {post.title}
        </h1>

        <div className="mt-8 space-y-5 text-base leading-relaxed text-ink/90">
          {post.body.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <p className="mt-10 rounded-xl border border-gold/30 bg-gold-soft/40 p-5 text-xs leading-relaxed text-ink/70">
          {disclaimer}
        </p>

        <div className="mt-10 rounded-2xl bg-teal p-8 text-center text-cream">
          <h2 className="font-display text-2xl font-bold text-white">
            Need help with this?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-cream/80">
            We turn guidance like this into action for your business.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-block rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
          >
            Get in touch
          </Link>
        </div>
      </article>
    </>
  );
}
