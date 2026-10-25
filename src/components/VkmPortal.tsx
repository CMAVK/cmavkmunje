"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import {
  FaLock, FaCircleCheck, FaCloudArrowUp, FaFile, FaXmark, FaTriangleExclamation,
  FaShieldHalved, FaRightFromBracket,
} from "react-icons/fa6";

type DocItem = { key: string; label: string; note?: string };
type UpFile = { id: string; name: string; size: number; doc_key: string | null };
type Session = {
  client_name: string; client_code: string | null; title: string; documents: DocItem[]; services: string[];
  max_files: number; max_file_mb: number; allowed_ext: string[]; expires_at: string; files: UpFile[];
};
type Stage = "loading" | "pin" | "intake" | "closed" | "work" | "done";

async function call<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: body === undefined ? {} : { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || "Something went wrong. Please try again."), { data, status: res.status });
  return data as T;
}

function fmtSize(b: number) {
  return b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1048576).toFixed(1)} MB`;
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Client side of the secure request: link (token) or client login, PIN,
// upload, tick services, submit once. With intakeToken (general Link Intake
// link) the visitor first enters their details and gets their own request.
export default function VkmPortal({ token, intakeToken }: { token?: string; intakeToken?: string }) {
  const [stage, setStage] = useState<Stage>(token || intakeToken ? "loading" : "pin");
  const [intake, setIntake] = useState<{ title: string; services: string[]; needs_pin: boolean } | null>(null);
  const [me, setMe] = useState({ name: "", phone: "", email: "", service: "" });
  const [firstName, setFirstName] = useState("");
  const [closedMsg, setClosedMsg] = useState("");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [s, setS] = useState<Session | null>(null);
  const [uploading, setUploading] = useState<{ name: string; pct: number }[]>([]);
  const [docKey, setDocKey] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [doneFiles, setDoneFiles] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadSession = useCallback(async () => {
    try {
      const data = await call<Session>("/api/vkm/session");
      setS(data);
      setStage("work");
    } catch (e) {
      const d = (e as { data?: { status?: string; error?: string }; status?: number });
      if (d.data?.status) { setClosedMsg(d.data.error || ""); setStage("closed"); }
      else setStage("pin");
    }
  }, []);

  useEffect(() => {
    if (!intakeToken) return;
    call<{ status: string; message: string; title: string; services: string[]; needs_pin: boolean }>(
      "/api/vkm/intake/open", { token: intakeToken })
      .then((d) => {
        if (d.status !== "open") { setClosedMsg(d.message); setStage("closed"); return; }
        setIntake(d);
        setStage("intake");
      })
      .catch((e: Error) => { setClosedMsg(e.message); setStage("closed"); });
  }, [intakeToken]);

  async function startIntake(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (intake?.needs_pin && !/^\d{6}$/.test(pin)) { setErr("Please enter the 6-digit PIN we gave you."); return; }
    setBusy(true);
    try {
      await call("/api/vkm/intake/start", { token: intakeToken, pin, ...me });
      setPin("");
      if (me.service) setServices([me.service]);
      setPhone(me.phone);
      await loadSession();
    } catch (e) {
      const d = e as Error & { data?: { status?: string } };
      if (d.data?.status) { setClosedMsg(d.message); setStage("closed"); }
      else setErr(d.message);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    call<{ status: string; message: string; first_name: string }>("/api/vkm/open", { token })
      .then((d) => {
        setFirstName(d.first_name);
        if (d.status !== "open") { setClosedMsg(d.message); setStage("closed"); }
        else setStage("pin");
      })
      .catch((e: Error) => { setClosedMsg(e.message); setStage("closed"); });
  }, [token]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!/^\d{6}$/.test(pin)) { setErr("Please enter the 6-digit PIN we sent you."); return; }
    setBusy(true);
    try {
      await call("/api/vkm/login", token ? { token, pin } : { client_code: code, pin });
      setPin("");
      await loadSession();
    } catch (e) {
      const d = e as Error & { data?: { status?: string } };
      if (d.data?.status) { setClosedMsg(d.message); setStage("closed"); }
      else setErr(d.message);
    } finally {
      setBusy(false);
    }
  }

  async function uploadOne(file: File) {
    if (!s) return;
    const ext = (file.name.match(/\.[A-Za-z0-9]+$/)?.[0] || "").toLowerCase();
    if (!s.allowed_ext.includes(ext)) throw new Error(`"${file.name}": please send PDF, photo (JPG/PNG/HEIC) or Word (.docx).`);
    if (file.size > s.max_file_mb * 1048576) throw new Error(`"${file.name}" is larger than ${s.max_file_mb} MB.`);
    const t = await call<{ file_id: string; upload_url: string; headers: Record<string, string> }>(
      "/api/vkm/upload-url", { name: file.name, size: file.size, mime: file.type, doc_key: docKey || null });
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", t.upload_url);
      Object.entries(t.headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploading((u) => u.map((x) => (x.name === file.name ? { ...x, pct: Math.round((ev.loaded / ev.total) * 100) } : x)));
        }
      };
      xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`"${file.name}" could not be uploaded. Please try again.`)));
      xhr.onerror = () => reject(new Error(`"${file.name}" could not be uploaded — check your internet and try again.`));
      xhr.send(file);
    });
    const done = await call<{ file: UpFile }>("/api/vkm/upload-done", { file_id: t.file_id });
    setS((cur) => (cur ? { ...cur, files: [...cur.files, done.file] } : cur));
  }

  async function addFiles(list: FileList | null) {
    if (!list || !s) return;
    setErr("");
    const files = Array.from(list);
    setUploading(files.map((f) => ({ name: f.name, pct: 0 })));
    for (const f of files) {
      try {
        await uploadOne(f);
      } catch (e) {
        const d = e as Error & { status?: number };
        setErr(d.message);
        if (d.status === 401 || d.status === 403) { setUploading([]); await loadSession(); return; }
      }
      setUploading((u) => u.filter((x) => x.name !== f.name));
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  async function removeFile(id: string) {
    try {
      await call("/api/vkm/remove-file", { file_id: id });
      setS((cur) => (cur ? { ...cur, files: cur.files.filter((f) => f.id !== id) } : cur));
    } catch (e) { setErr((e as Error).message); }
  }

  async function submit() {
    setErr("");
    setBusy(true);
    try {
      const r = await call<{ files: number }>("/api/vkm/submit", { services, message, phone });
      setDoneFiles(r.files);
      setStage("done");
    } catch (e) {
      setErr((e as Error).message);
      setConfirm(false);
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await call("/api/vkm/logout", {}).catch(() => undefined);
    setS(null);
    setStage("pin");
  }

  const card = "rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8";
  const input = "w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-base outline-none focus:border-teal focus:ring-2 focus:ring-teal/20";
  const btn = "inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-base font-semibold text-white hover:bg-teal-dark disabled:opacity-50";

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal">
          <FaShieldHalved className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide text-gold">{site.name}</p>
        <h1 className="mt-1 text-2xl font-bold text-teal sm:text-3xl">Secure Document Submission</h1>
      </div>

      {stage === "loading" && <div className={`${card} text-center text-muted`}>Checking your link…</div>}

      {stage === "closed" && (
        <div className={`${card} text-center`}>
          <FaLock className="mx-auto mb-3 h-8 w-8 text-gold" />
          <p className="text-base text-ink">{closedMsg || "This link can no longer be used."}</p>
          <p className="mt-4 text-sm text-muted">
            Call / WhatsApp {site.contact.phones[0]} · {site.contact.email}
          </p>
        </div>
      )}

      {stage === "intake" && intake && (
        <form onSubmit={startIntake} className={card}>
          <h2 className="text-lg font-semibold text-ink">{intake.title}</h2>
          <p className="mt-1 text-sm text-muted">Tell us who you are, then upload your documents on the next screen.</p>
          <label className="mt-5 block">
            <span className="mb-1 block text-sm font-medium text-ink">Full name</span>
            <input className={input} value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })}
              autoComplete="name" required maxLength={120} />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-ink">Mobile number</span>
            <input className={input} value={me.phone} onChange={(e) => setMe({ ...me, phone: e.target.value })}
              inputMode="tel" autoComplete="tel" required maxLength={15} placeholder="10-digit mobile" />
          </label>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-ink">Email (optional)</span>
            <input className={input} type="email" value={me.email} onChange={(e) => setMe({ ...me, email: e.target.value })}
              autoComplete="email" maxLength={120} />
          </label>
          {intake.services.length > 0 && (
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-ink">Service you need</span>
              <select className={input} value={me.service} onChange={(e) => setMe({ ...me, service: e.target.value })}>
                <option value="">Choose (optional)</option>
                {intake.services.map((sv) => <option key={sv} value={sv}>{sv}</option>)}
              </select>
            </label>
          )}
          {intake.needs_pin && (
            <label className="mt-4 block">
              <span className="mb-1 block text-sm font-medium text-ink">PIN</span>
              <input className={`${input} tracking-[0.5em]`} value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" required />
            </label>
          )}
          {err && <p className="mt-3 flex items-start gap-2 text-sm text-red-700"><FaTriangleExclamation className="mt-0.5 shrink-0" />{err}</p>}
          <button type="submit" className={`${btn} mt-6 w-full`} disabled={busy}>
            <FaLock /> {busy ? "Please wait…" : "Continue"}
          </button>
          <p className="mt-4 text-center text-xs text-muted">Your details are used only by {site.name} to contact you about your work.</p>
        </form>
      )}

      {stage === "pin" && (
        <form onSubmit={login} className={card}>
          <h2 className="text-lg font-semibold text-ink">
            {token ? (firstName ? `Namaste ${firstName} 🙏` : "Namaste 🙏") : "Client login"}
          </h2>
          <p className="mt-1 text-sm text-muted">
            {token
              ? "For your safety, enter the 6-digit PIN we sent you separately."
              : "Enter your Client ID and the 6-digit PIN we sent you."}
          </p>
          {!token && (
            <label className="mt-5 block">
              <span className="mb-1 block text-sm font-medium text-ink">Client ID</span>
              <input className={input} value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VKM1004" autoComplete="username" autoCapitalize="characters" required maxLength={20} />
            </label>
          )}
          <label className="mt-5 block">
            <span className="mb-1 block text-sm font-medium text-ink">PIN</span>
            <input className={`${input} tracking-[0.5em]`} value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" required />
          </label>
          {err && <p className="mt-3 flex items-start gap-2 text-sm text-red-700"><FaTriangleExclamation className="mt-0.5 shrink-0" />{err}</p>}
          <button type="submit" className={`${btn} mt-6 w-full`} disabled={busy}>
            <FaLock /> {busy ? "Checking…" : "Continue securely"}
          </button>
          <p className="mt-4 text-center text-xs text-muted">
            5 wrong PINs lock this request. Your link works only for you — please don&apos;t forward it.
          </p>
        </form>
      )}

      {stage === "work" && s && (
        <div className="space-y-6">
          <div className={card}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted">{s.title}</p>
                <h2 className="text-lg font-semibold text-ink">{s.client_name}</h2>
                <p className="text-xs text-muted">{s.client_code ? `Client ID ${s.client_code} · ` : ""}open till {fmtDate(s.expires_at)}</p>
              </div>
              <button onClick={logout} className="inline-flex items-center gap-1 text-sm text-muted hover:text-teal">
                <FaRightFromBracket /> Log out
              </button>
            </div>
            {s.documents.length > 0 && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-ink">Documents we need from you</p>
                <ul className="space-y-1.5">
                  {s.documents.map((d) => {
                    const got = s.files.some((f) => f.doc_key === d.key);
                    return (
                      <li key={d.key} className="flex items-start gap-2 text-sm">
                        <FaCircleCheck className={`mt-0.5 shrink-0 ${got ? "text-emerald-600" : "text-black/15"}`} />
                        <span>{d.label}{d.note ? <span className="text-muted"> — {d.note}</span> : null}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div className={card}>
            <p className="mb-3 text-sm font-semibold text-ink">1. Upload documents</p>
            {s.documents.length > 0 && (
              <label className="mb-3 block">
                <span className="mb-1 block text-sm text-muted">This upload is for</span>
                <select className={input} value={docKey} onChange={(e) => setDocKey(e.target.value)}>
                  <option value="">Other / not sure</option>
                  {s.documents.map((d) => <option key={d.key} value={d.key}>{d.label}</option>)}
                </select>
              </label>
            )}
            <button type="button" onClick={() => inputRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-teal/30 bg-cream px-4 py-8 text-center hover:border-teal">
              <FaCloudArrowUp className="mb-2 h-8 w-8 text-teal" />
              <span className="text-base font-semibold text-teal">Choose files or take a photo</span>
              <span className="mt-1 text-xs text-muted">PDF, JPG, PNG, HEIC, Word · up to {s.max_file_mb} MB each · max {s.max_files} files</span>
            </button>
            <input ref={inputRef} type="file" multiple className="hidden" accept={s.allowed_ext.join(",")}
              onChange={(e) => addFiles(e.target.files)} />
            {uploading.map((u) => (
              <div key={u.name} className="mt-3 text-sm">
                <div className="flex justify-between"><span className="truncate">{u.name}</span><span>{u.pct}%</span></div>
                <div className="mt-1 h-1.5 rounded bg-black/10"><div className="h-1.5 rounded bg-teal" style={{ width: `${u.pct}%` }} /></div>
              </div>
            ))}
            {s.files.length > 0 && (
              <ul className="mt-4 divide-y divide-black/5 rounded-xl border border-black/10">
                {s.files.map((f) => (
                  <li key={f.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                    <FaFile className="shrink-0 text-teal" />
                    <span className="min-w-0 flex-1 truncate">
                      {f.name}
                      {f.doc_key && <span className="text-muted"> · {s.documents.find((d) => d.key === f.doc_key)?.label}</span>}
                    </span>
                    <span className="text-xs text-muted">{fmtSize(f.size)}</span>
                    <button onClick={() => removeFile(f.id)} aria-label={`Remove ${f.name}`} className="text-muted hover:text-red-700"><FaXmark /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className={card}>
            <p className="mb-3 text-sm font-semibold text-ink">2. Services you need (optional)</p>
            {s.services.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {s.services.map((sv) => (
                  <label key={sv} className="flex items-center gap-2 rounded-xl border border-black/10 px-3 py-2 text-sm">
                    <input type="checkbox" checked={services.includes(sv)}
                      onChange={(e) => setServices((cur) => (e.target.checked ? [...cur, sv] : cur.filter((x) => x !== sv)))} />
                    {sv}
                  </label>
                ))}
              </div>
            ) : null}
            <textarea className={`${input} mt-3`} rows={3} maxLength={2000} value={message}
              onChange={(e) => setMessage(e.target.value)} placeholder="Anything we should know? (optional)" />
            <input className={`${input} mt-3`} value={phone} onChange={(e) => setPhone(e.target.value)}
              inputMode="tel" placeholder="Mobile number to contact you (optional)" maxLength={20} />
          </div>

          {err && <p className="flex items-start gap-2 text-sm text-red-700"><FaTriangleExclamation className="mt-0.5 shrink-0" />{err}</p>}

          <div className={card}>
            {!confirm ? (
              <button className={`${btn} w-full`} disabled={busy || uploading.length > 0} onClick={() => setConfirm(true)}>
                3. Submit to {site.name}
              </button>
            ) : (
              <div>
                <p className="text-sm text-ink">
                  Submit {s.files.length} file{s.files.length === 1 ? "" : "s"} now? <b>After submitting, this link closes</b> —
                  to add anything later, contact us and we will re-open it.
                </p>
                <div className="mt-4 flex gap-3">
                  <button className={`${btn} flex-1`} disabled={busy} onClick={submit}>{busy ? "Submitting…" : "Yes, submit"}</button>
                  <button className="flex-1 rounded-xl border border-black/15 px-5 py-3 font-semibold text-ink" onClick={() => setConfirm(false)}>Go back</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "done" && (
        <div className={`${card} text-center`}>
          <FaCircleCheck className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
          <h2 className="text-xl font-semibold text-ink">Thank you — submitted!</h2>
          <p className="mt-2 text-sm text-muted">
            We received {doneFiles} file{doneFiles === 1 ? "" : "s"}. Our team will review and contact you.
            This link is now closed for your security.
          </p>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted">
        <FaLock className="mr-1 inline" /> Encrypted connection · files are stored privately and moved to our office system after you submit.
      </p>
    </section>
  );
}
