import type { Metadata } from "next";
import VkmPortal from "@/components/VkmPortal";

export const metadata: Metadata = {
  title: "Client Login — Document Submission",
  robots: { index: false, follow: false },
};

// "Client login": Client ID + PIN, for clients who prefer not to use the link.
export default function ClientRequestLogin() {
  return <VkmPortal />;
}
