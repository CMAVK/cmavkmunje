"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { dueDates } from "@/lib/site";
import {
  FaFileLines, FaCircleCheck, FaClock, FaTriangleExclamation,
  FaDownload, FaRightFromBracket, FaComments, FaCalendarDay,
} from "react-icons/fa6";

// Demo data — scalable architecture; replace with per-client records later.
const compliance = [
  { label: "GST Return (GSTR-3B)", status: "Filed", tone: "ok" as const, note: "For last month" },
  { label: "GST Return (GSTR-1)", status: "Filed", tone: "ok" as const, note: "For last month" },
  { label: "TDS Return (26Q)", status: "Due", tone: "due" as const, note: "Quarter ending" },
  { label: "ROC Annual Filing", status: "Upcoming", tone: "due" as const, note: "AOC-4 / MGT-7" },
  { label: "Income Tax Return", status: "Pending docs", tone: "warn" as const, note: "Awaiting documents" },
];

const notices = [
  { title: "No active notices", detail: "You have no pending department notices.", clear: true },
];

const communications = [
  { from: "VKM & Co.", msg: "GSTR-3B filed and challan shared on your email.", when: "Recently" },
  { from: "VKM & Co.", msg: "Please share bank statements for ITR preparation.", when: "Recently" },
];

const reports = [
  "GST Summary Report",
  "TDS Compliance Report",
  "Annual Compliance Report",
];

function toneClasses(tone: "ok" | "due" | "warn") {
  if (tone === "ok") return "bg-emerald-50 text-emerald-700";
  if (tone === "warn") return "bg-amber-50 text-amber-700";
  return "bg-teal/10 text-teal";
}

export default function DashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [docs, setDocs] = useState<{ name: string; date: string }[]>([]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      router.replace("/login");
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setEmail(data.session.user.email ?? "Client");
      setChecking(false);

      // Fetch this client's own uploaded documents (RLS filters by their email).
      supabase
        .from("documents")
        .select("file_name, created_at")
        .order("created_at", { ascending: false })
        .then(({ data: rows }) => {
          setDocs(
            (rows || []).map((d) => ({
              name: d.file_name as string,
              date: new Date(d.created_at as string).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
            }))
          );
        });
    });
  }, [router]);

  async function signOut() {
    const supabase = getSupabase();
    await supabase?.auth.signOut();
    router.replace("/login");
  }

  if (checking) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-muted">Loading your dashboard…</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal">Client Dashboard</h1>
          <p className="text-sm text-muted">Signed in as {email}</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/upload"
            className="flex items-center gap-2 rounded-full bg-teal px-5 py-2 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03]"
          >
            <FaFileLines className="h-4 w-4" /> Submit Documents
          </a>
          <button
            onClick={signOut}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink hover:bg-cream-deep"
          >
            <FaRightFromBracket className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      <p className="mb-6 rounded-xl bg-gold/10 px-4 py-2 text-xs text-gold-light/90 ring-1 ring-gold/20">
        <span className="font-semibold text-gold">Demo:</span> this dashboard shows sample data. Your live compliance data will appear here once activated.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Compliance status */}
        <div className="lg:col-span-2 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaCircleCheck className="h-5 w-5 text-teal" /> Compliance Status
          </h2>
          <ul className="space-y-2.5">
            {compliance.map((c) => (
              <li key={c.label} className="flex items-center justify-between rounded-lg bg-cream/60 px-4 py-2.5">
                <div>
                  <p className="text-sm font-medium text-ink">{c.label}</p>
                  <p className="text-xs text-muted">{c.note}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClasses(c.tone)}`}>
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Due date tracker */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaCalendarDay className="h-5 w-5 text-teal" /> Due Date Tracker
          </h2>
          <ul className="space-y-2">
            {dueDates.slice(0, 6).map((d) => (
              <li key={d.task} className="flex items-start gap-2 text-sm">
                <FaClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold" />
                <span>
                  <span className="font-medium text-ink">{d.date}</span>
                  <span className="block text-xs text-muted">{d.task}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Uploaded documents */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaFileLines className="h-5 w-5 text-teal" /> Uploaded Documents
          </h2>
          {docs.length === 0 ? (
            <p className="rounded-lg bg-cream/60 px-3 py-4 text-center text-sm text-muted">
              You haven&apos;t submitted any documents yet.
            </p>
          ) : (
            <ul className="space-y-2">
              {docs.map((d, i) => (
                <li key={i} className="rounded-lg bg-cream/60 px-3 py-2">
                  <p className="truncate text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-muted">Submitted {d.date}</p>
                </li>
              ))}
            </ul>
          )}
          <a href="/upload" className="mt-3 inline-block text-xs font-semibold text-teal hover:underline">
            + Upload more documents
          </a>
        </div>

        {/* Notices */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaTriangleExclamation className="h-5 w-5 text-teal" /> Notices Tracking
          </h2>
          {notices.map((n) => (
            <div key={n.title} className="rounded-lg bg-emerald-50 px-4 py-3">
              <p className="text-sm font-medium text-emerald-700">{n.title}</p>
              <p className="text-xs text-emerald-600/80">{n.detail}</p>
            </div>
          ))}
        </div>

        {/* Reports */}
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaDownload className="h-5 w-5 text-teal" /> Download Reports
          </h2>
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r}>
                <button className="flex w-full items-center justify-between rounded-lg bg-cream/60 px-3 py-2 text-left text-sm text-ink hover:bg-cream-deep">
                  {r}
                  <FaDownload className="h-3.5 w-3.5 text-muted" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Communication history */}
        <div className="lg:col-span-3 rounded-2xl border border-black/10 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-ink">
            <FaComments className="h-5 w-5 text-teal" /> Communication History
          </h2>
          <ul className="space-y-3">
            {communications.map((c, i) => (
              <li key={i} className="flex gap-3 rounded-lg bg-cream/60 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-bold text-white">
                  VK
                </div>
                <div>
                  <p className="text-sm text-ink">{c.msg}</p>
                  <p className="text-xs text-muted">{c.from} · {c.when}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
