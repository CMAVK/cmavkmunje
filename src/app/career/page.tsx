import type { Metadata } from "next";
import Link from "next/link";
import { careers, careerPerks, posts, site } from "@/lib/site";
import { FaBriefcase, FaLocationDot, FaArrowRight, FaGraduationCap } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Career",
  description:
    "Build your career with V K Munje & Company — articleship, internships and full-time roles, plus articles for professional growth.",
};

export default function CareerPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-teal text-cream">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-gold-light">Career</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
            Grow your career with us
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-cream/80">
            Join a multi-disciplinary CMA firm where you&apos;ll learn across taxation,
            audit and compliance — with real responsibility and mentorship from day one.
          </p>
        </div>
      </section>

      {/* Why join — perks */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="accent-rule mb-5" />
        <h2 className="font-display text-2xl font-bold text-teal sm:text-3xl">Life at the firm</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {careerPerks.map((p) => (
            <div key={p.title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <h3 className="font-display text-base font-semibold text-teal">{p.title}</h3>
              <p className="mt-2 text-sm text-muted">{p.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Openings */}
      <section className="bg-cream-deep">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="accent-rule mb-5" />
          <h2 className="font-display text-2xl font-bold text-teal sm:text-3xl">Current openings</h2>
          <p className="mt-3 max-w-2xl text-muted">
            Send your CV to <a href={`mailto:${site.contact.email}`} className="font-semibold text-teal hover:underline">{site.contact.email}</a> or apply below.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {careers.map((job) => (
              <div key={job.role} className="flex flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-3 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                    <FaBriefcase className="h-3 w-3" /> {job.type}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-gold/10 px-3 py-1 text-xs font-semibold text-gold">
                    <FaLocationDot className="h-3 w-3" /> {job.location}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-teal">{job.role}</h3>
                <p className="mt-2 flex-1 text-sm text-muted">{job.desc}</p>
                <a
                  href={`mailto:${site.contact.email}?subject=${encodeURIComponent(`Application: ${job.role}`)}`}
                  className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
                >
                  Apply now <FaArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Professional growth — articles */}
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-center gap-3">
          <FaGraduationCap className="h-7 w-7 text-gold" />
          <h2 className="font-display text-2xl font-bold text-teal sm:text-3xl">
            Articles for professional growth
          </h2>
        </div>
        <p className="mt-3 max-w-2xl text-muted">
          Practical reading for students and professionals building a career in tax, audit and compliance.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-gold">{post.cat}</span>
              <h3 className="mt-2 font-display text-base font-semibold text-teal group-hover:underline">
                {post.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{post.excerpt}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                Read article <FaArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-teal-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 py-14 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Don&apos;t see the right role?
          </h2>
          <p className="max-w-xl text-cream/80">
            We&apos;re always glad to hear from talented, motivated people. Send us your CV and a short note.
          </p>
          <a
            href={`mailto:${site.contact.email}?subject=${encodeURIComponent("Career enquiry")}`}
            className="rounded-full bg-gold px-7 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03]"
          >
            Send your CV
          </a>
        </div>
      </section>
    </>
  );
}
