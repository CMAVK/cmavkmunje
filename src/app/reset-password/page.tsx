"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { FaKey } from "react-icons/fa6";

export default function ResetPasswordPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Supabase parses the recovery token from the URL and emits a
  // PASSWORD_RECOVERY session. We just confirm a session is available.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!supabase) return;
    const data = new FormData(e.currentTarget);
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }

    setBusy(true);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updErr) { setError(updErr.message); return; }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-teal">
          <FaKey className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-teal">Set a New Password</h1>
      </div>

      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        {done ? (
          <p className="text-center text-sm text-emerald-700">
            Password updated! Redirecting you to your dashboard…
          </p>
        ) : !ready ? (
          <p className="text-center text-sm text-muted">
            Open this page from the reset link in your email. If you got here by mistake,{" "}
            <a href="/login" className="font-semibold text-teal hover:underline">return to login</a>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">New Password</label>
              <input name="password" type="password" required minLength={6} className={field} placeholder="At least 6 characters" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Confirm Password</label>
              <input name="confirm" type="password" required minLength={6} className={field} placeholder="Re-enter password" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={busy} className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white disabled:opacity-60">
              {busy ? "Updating…" : "Update Password"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
