import type { Metadata } from "next";
import VkmPortal from "@/components/VkmPortal";

export const metadata: Metadata = {
  title: "Secure Document Submission",
  robots: { index: false, follow: false },
};

export default async function RequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <VkmPortal token={token} />;
}
