import type { Metadata } from "next";
import VkmPortal from "@/components/VkmPortal";

export const metadata: Metadata = {
  title: "Secure Document Submission",
  robots: { index: false, follow: false },
};

// General intake link (Link Intake): anyone with the link can submit once.
export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <VkmPortal intakeToken={token} />;
}
