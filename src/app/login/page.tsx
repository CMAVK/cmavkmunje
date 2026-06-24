import type { Metadata } from "next";
import LoginForm from "@/components/LoginForm";
import { FaUserLock } from "react-icons/fa6";

export const metadata: Metadata = {
  title: "Client Login",
  description: "Secure client portal login for V K Munje & Company.",
};

export default function LoginPage() {
  return (
    <section className="mx-auto flex max-w-md flex-col px-4 py-20 sm:px-6">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal/10 text-teal">
          <FaUserLock className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold text-teal">Client Portal</h1>
        <p className="mt-2 text-sm text-muted">
          Sign in or create your account to track your documents and compliance.
        </p>
      </div>
      <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
        <LoginForm />
      </div>
    </section>
  );
}
