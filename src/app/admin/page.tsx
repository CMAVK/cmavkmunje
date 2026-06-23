"use client";

import { useEffect, useState, useCallback } from "react";
import { StarDisplay } from "@/components/StarRating";
import {
  FaLock, FaRightFromBracket, FaStar, FaRegStar, FaEye, FaEyeSlash,
  FaTrash, FaCircleCheck, FaFileLines, FaDownload, FaArrowsRotate,
} from "react-icons/fa6";

type Review = {
  id: string; name: string; company: string | null; rating: number;
  category: string; review: string; status: string; featured: boolean; created_at: string;
};
type Doc = {
  id: string; client_name: string; email: string | null; phone: string | null;
  category: string; file_name: string; created_at: string; url: string | null;
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"reviews" | "documents">("reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [dataError, setDataError] = useState("");

  const loadReviews = useCallback(async () => {
    setDataError("");
    const res = await fetch("/api/admin/reviews", { cache: "no-store" });
    if (res.status === 401) { setAuthed(false); return; }
    const json = await res.json();
    if (!res.ok) {
      setDataError(`Could not load reviews (${res.status}): ${json.error || "unknown error"}`);
    }
    setReviews(json.reviews || []);
    setAuthed(true);
  }, []);

  const loadDocs = useCallback(async () => {
    setDataError("");
    const res = await fetch("/api/admin/documents", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setDataError(`Could not load documents (${res.status}): ${json.error || "unknown error"}`);
    }
    setDocs(json.documents || []);
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);
  // Re-fetch whenever a tab is opened so data is always current.
  useEffect(() => {
    if (!authed) return;
    if (tab === "reviews") loadReviews();
    if (tab === "documents") loadDocs();
  }, [authed, tab, loadReviews, loadDocs]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { setPassword(""); loadReviews(); }
    else setError((await res.json()).error || "Login failed.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setReviews([]);
  }

  async function patchReview(id: string, body: Record<string, unknown>) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
    loadReviews();
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review permanently?")) return;
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadReviews();
  }

  // ---- Login screen ----
  if (authed === null) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading…</div>;
  }
  if (authed === false) {
    return (
      <section className="mx-auto flex max-w-sm flex-col px-4 py-20">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
            <FaLock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold text-teal">Admin Panel</h1>
          <p className="mt-1 text-sm text-muted">Authorised access only.</p>
        </div>
        <form onSubmit={login} className="space-y-3 rounded-2xl border border-black/10 bg-white p-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 text-sm outline-none focus:border-teal"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-full bg-teal px-6 py-2.5 text-sm font-semibold text-white">Sign In</button>
        </form>
      </section>
    );
  }

  const pending = reviews.filter((r) => r.status === "pending");

  // ---- Dashboard ----
  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-teal">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (tab === "reviews" ? loadReviews() : loadDocs())}
            className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-cream-deep"
          >
            <FaArrowsRotate className="h-4 w-4" /> Refresh
          </button>
          <button onClick={logout} className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:bg-cream-deep">
            <FaRightFromBracket className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>

      {dataError && (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 ring-1 ring-red-200">
          {dataError}
        </p>
      )}

      <div className="mb-6 flex gap-2">
        {(["reviews", "documents"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? "bg-teal text-white" : "bg-cream-deep text-ink hover:bg-teal/10"
            }`}
          >
            {t}
            {t === "reviews" && pending.length > 0 && (
              <span className="ml-2 rounded-full bg-gold px-1.5 text-xs text-white">{pending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews */}
      {tab === "reviews" && (
        <div className="space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted">No reviews yet.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <StarDisplay value={r.rating} />
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.status === "approved" ? "bg-emerald-50 text-emerald-700"
                      : r.status === "hidden" ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-700"
                    }`}>{r.status}</span>
                    {r.featured && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-semibold text-gold">featured</span>}
                  </div>
                  <p className="mt-2 text-sm text-ink">“{r.review}”</p>
                  <p className="mt-1 text-xs text-muted">
                    {r.name}{r.company ? ` · ${r.company}` : ""} · {r.category}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {r.status !== "approved" && (
                  <button onClick={() => patchReview(r.id, { status: "approved" })} className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white">
                    <FaCircleCheck className="h-3.5 w-3.5" /> Approve
                  </button>
                )}
                {r.status !== "hidden" && (
                  <button onClick={() => patchReview(r.id, { status: "hidden" })} className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white">
                    <FaEyeSlash className="h-3.5 w-3.5" /> Hide
                  </button>
                )}
                {r.status === "hidden" && (
                  <button onClick={() => patchReview(r.id, { status: "approved" })} className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">
                    <FaEye className="h-3.5 w-3.5" /> Unhide
                  </button>
                )}
                <button onClick={() => patchReview(r.id, { featured: !r.featured })} className="flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-white">
                  {r.featured ? <FaRegStar className="h-3.5 w-3.5" /> : <FaStar className="h-3.5 w-3.5" />}
                  {r.featured ? "Unfeature" : "Feature"}
                </button>
                <button onClick={() => deleteReview(r.id)} className="flex items-center gap-1.5 rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                  <FaTrash className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Documents */}
      {tab === "documents" && (
        <div className="space-y-3">
          {docs.length === 0 && <p className="text-sm text-muted">No document submissions yet.</p>}
          {docs.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/10 bg-white p-4">
              <FaFileLines className="h-5 w-5 shrink-0 text-teal" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{d.file_name}</p>
                <p className="text-xs text-muted">
                  {d.client_name} · {d.category}
                  {d.phone ? ` · ${d.phone}` : ""}{d.email ? ` · ${d.email}` : ""}
                </p>
              </div>
              {d.url && (
                <a href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-teal px-3 py-1.5 text-xs font-semibold text-white">
                  <FaDownload className="h-3.5 w-3.5" /> Download
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
