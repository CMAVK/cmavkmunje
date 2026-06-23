"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function LoginForm() {
  const supabase = getSupabase();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!supabase) {
      setError("Login isn't configured yet. Please contact the firm.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");

    setBusy(true);
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);

    if (authErr) {
      setError("Invalid email or password. Please try again.");
      return;
    }
    router.push("/dashboard");
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
        <input name="email" type="email" required className={field} placeholder="you@email.com" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
        <input name="password" type="password" required className={field} placeholder="••••••••" />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign In"}
      </button>

      <p className="text-center text-xs text-muted">
        Client login is provided by the firm. Don&apos;t have access yet? Please contact us.
      </p>
    </form>
  );
}
