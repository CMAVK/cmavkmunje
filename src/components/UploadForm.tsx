"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { site } from "@/lib/site";
import { FaCloudArrowUp, FaFile, FaXmark, FaCircleCheck } from "react-icons/fa6";

const CATEGORIES = [
  "GST Documents",
  "Income Tax Documents",
  "TDS Documents",
  "PF & ESIC Documents",
  "ROC Documents",
  "Audit Documents",
  "Project Reports",
  "Loan Documents",
  "Other",
];

const ACCEPT = ".pdf,.xls,.xlsx,.doc,.docx,.zip,.jpg,.jpeg,.png";
const MAX_MB = 25;

function fmtSize(bytes: number) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default function UploadForm() {
  const supabase = getSupabase();
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [me, setMe] = useState({ name: "", phone: "", email: "" });
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from the logged-in client (if any), so uploads are tagged to them.
  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user;
      if (u) {
        setMe({
          name: (u.user_metadata?.name as string) || "",
          phone: (u.user_metadata?.phone as string) || "",
          email: u.email || "",
        });
      }
    });
  }, [supabase]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((f) => {
      if (f.size > MAX_MB * 1024 * 1024) {
        setError(`"${f.name}" is larger than ${MAX_MB} MB and was skipped.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...incoming]);
  }

  function removeFile(i: number) {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (files.length === 0) {
      setError("Please add at least one document.");
      return;
    }
    if (!supabase) {
      setError("Upload service isn't configured yet. Please email your documents or call us.");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const clientName = String(data.get("client_name") || "");
    const email = String(data.get("email") || "");
    const phone = String(data.get("phone") || "");
    const category = String(data.get("category") || "");

    setBusy(true);
    setProgress(0);

    try {
      const stamp = Date.now();
      const safeClient = clientName.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const safeName = file.name.replace(/[^a-z0-9.\-_]+/gi, "_");
        const path = `${safeClient}/${stamp}-${i}-${safeName}`;

        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(path, file, { upsert: false });
        if (upErr) throw upErr;

        const { error: dbErr } = await supabase.from("documents").insert({
          client_name: clientName,
          email,
          phone,
          category,
          file_name: file.name,
          file_path: path,
        });
        if (dbErr) throw dbErr;

        setProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Notify the firm by email (Formspree), if configured.
      const FORMSPREE = process.env.NEXT_PUBLIC_FORMSPREE_ID;
      if (FORMSPREE) {
        fetch(`https://formspree.io/f/${FORMSPREE}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: `New document submission — ${clientName} (${category})`,
            client: clientName,
            email,
            phone,
            category,
            files: files.map((f) => f.name).join(", "),
          }),
        }).catch(() => {});
      }

      setDone(true);
      form.reset();
      setFiles([]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      setError(msg + " — please try again or email your documents to us.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-lg border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-teal focus:ring-2 focus:ring-teal/20";

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <FaCircleCheck className="h-16 w-16 text-teal" />
        <h3 className="text-xl font-bold text-teal">Documents Submitted Successfully</h3>
        <p className="max-w-md text-sm text-muted">
          Your documents have been successfully submitted. Our team will review them and contact you shortly.
        </p>
        <button
          onClick={() => setDone(false)}
          className="mt-2 rounded-full border border-teal px-5 py-2 text-sm font-semibold text-teal hover:bg-teal hover:text-white"
        >
          Submit more documents
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Your Name *</label>
          <input name="client_name" required className={field} placeholder="Full name / business name" defaultValue={me.name} key={"n" + me.name} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Phone *</label>
          <input name="phone" required inputMode="tel" className={field} placeholder="10-digit mobile" defaultValue={me.phone} key={"p" + me.phone} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input name="email" type="email" className={field} placeholder="your@email.com" defaultValue={me.email} key={"e" + me.email} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink">Document Category *</label>
          <select name="category" required className={field} defaultValue="">
            <option value="" disabled>Select category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          dragOver ? "border-teal bg-teal/5" : "border-black/15 bg-cream/50 hover:border-teal/50"
        }`}
      >
        <FaCloudArrowUp className="mb-3 h-10 w-10 text-teal" />
        <p className="text-sm font-medium text-ink">Drag &amp; drop files here, or click to browse</p>
        <p className="mt-1 text-xs text-muted">
          PDF, Excel, Word, ZIP, JPG, PNG · up to {MAX_MB} MB each · multiple allowed
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f, i) => (
            <li key={i} className="flex items-center gap-3 rounded-lg border border-black/10 bg-white px-3 py-2">
              <FaFile className="h-4 w-4 shrink-0 text-teal" />
              <span className="flex-1 truncate text-sm text-ink">{f.name}</span>
              <span className="text-xs text-muted">{fmtSize(f.size)}</span>
              {!busy && (
                <button type="button" onClick={() => removeFile(i)} aria-label="Remove" className="text-muted hover:text-red-500">
                  <FaXmark className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {busy && (
        <div className="space-y-1.5">
          <div className="h-2 w-full overflow-hidden rounded-full bg-cream-deep">
            <div className="h-full bg-teal transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-xs text-muted">Uploading… {progress}%</p>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.01] disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Submit Documents Securely"}
      </button>

      <p className="text-center text-xs text-muted">
        Your files are stored securely and handled with strict confidentiality. Need help? Call{" "}
        <a href={`tel:+91${site.contact.phones[0]}`} className="font-semibold text-teal">+91 {site.contact.phones[0]}</a>.
      </p>
    </form>
  );
}
