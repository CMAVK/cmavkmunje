import { redirect } from "next/navigation";

// Reviews are now part of the combined /connect page.
export default function FeedbackRedirect() {
  redirect("/connect?tab=reviews");
}
