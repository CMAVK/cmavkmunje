import type { Metadata } from "next";
import UploadForm from "@/components/UploadForm";
import { FaShieldHalved, FaLock, FaBell } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Upload Documents",
  description:
    "Securely upload your GST, Income Tax, TDS, ROC and audit documents to V K Munje & Company.",
};

export default function UploadPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="accent-rule mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-teal sm:text-4xl">Upload Documents</h1>
        <p className="mt-3 text-base text-muted">
          Send your documents to us securely. Drag, drop and submit — we&apos;ll take it from there.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
        <div className="space-y-4">
          {[
            { icon: FaShieldHalved, title: "Secure Storage", note: "Files are stored in encrypted, access-controlled storage." },
            { icon: FaLock, title: "Confidential", note: "Handled under strict professional confidentiality." },
            { icon: FaBell, title: "Instant Notification", note: "Our team is notified the moment you submit." },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-5">
              <item.icon className="mb-2 h-6 w-6 text-gold" />
              <h2 className="text-base font-semibold text-ink">{item.title}</h2>
              <p className="mt-1 text-sm text-muted">{item.note}</p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
            <UploadForm />
          </div>
        </div>
      </div>
    </section>
  );
}
