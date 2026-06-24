"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";

type Mode = "signin" | "signup" | "forgot";

export default function LoginForm() {
  const supabase = getSupabase();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setInfo("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!supabase) {
      setError("Login isn't configured yet. Please contact the firm.");
      return;
    }
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");

    setBusy(true);

    // ---- Forgot password: send reset email ----
    if (mode === "forgot") {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${site.url}/reset-password`,
      });
      setBusy(false);
      if (resetErr) {
        setError(resetErr.message);
        return;
      }
      setInfo("Password reset link sent! Please check your email.");
      return;
    }

    // ---- Sign up ----
    if (mode === "signup") {
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      if (password.length < 6) {
        setBusy(false);
        setError("Password must be at least 6 characters.");
        return;
      }
      const { data: res, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone } },
      });
      setBusy(false);
      if (signErr) {
        setError(signErr.message);
        return;
      }
      if (res.session) {
        router.push("/dashboard");
      } else {
        setInfo("Account created! Please check your email to confirm your address, then sign in.");
        setMode("signin");
      }
      return;
    }

    // ---- Sign in ----
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
    <div>
      {/* Mode toggle (hidden in forgot view) */}
      {mode !== "forgot" && (
        <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-cream-deep p-1 text-sm font-medium">
          <button type="button" onClick={() => switchMode("signin")} className={`rounded-full py-2 transition-colors ${mode === "signin" ? "bg-teal text-white" : "text-muted"}`}>
            Sign In
          </button>
          <button type="button" onClick={() => switchMode("signup")} className={`rounded-full py-2 transition-colors ${mode === "signup" ? "bg-teal text-white" : "text-muted"}`}>
            Create Account
          </button>
        </div>
      )}

      {mode === "forgot" && (
        <div className="mb-4">
          <h3 className="font-display text-lg font-semibold text-teal">Reset your password</h3>
          <p className="mt-1 text-sm text-muted">Enter your email and we&apos;ll send you a reset link.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Full Name</label>
              <input name="name" required className={field} placeholder="Your name / business name" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Phone</label>
              <input name="phone" required inputMode="tel" className={field} placeholder="10-digit mobile" />
            </div>
          </>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input name="email" type="email" required className={field} placeholder="you@email.com" />
        </div>

        {mode !== "forgot" && (
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-sm font-medium text-ink">Password</label>
              {mode === "signin" && (
                <button type="button" onClick={() => switchMode("forgot")} className="text-xs font-medium text-teal hover:underline">
                  Forgot password?
                </button>
              )}
            </div>
            <input name="password" type="password" required minLength={6} className={field} placeholder="At least 6 characters" />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{info}</p>}

        <button type="submit" disabled={busy} className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60">
          {busy ? "Please wait…" : mode === "signup" ? "Create Account" : mode === "forgot" ? "Send Reset Link" : "Sign In"}
        </button>

        {mode === "forgot" ? (
          <button type="button" onClick={() => switchMode("signin")} className="block w-full text-center text-xs font-medium text-teal hover:underline">
            ← Back to sign in
          </button>
        ) : (
          <p className="text-center text-xs text-muted">
            {mode === "signup"
              ? "By creating an account you can track your documents and compliance with us."
              : "New client? Switch to “Create Account” above to register."}
          </p>
        )}
      </form>
    </div>
  );
}
