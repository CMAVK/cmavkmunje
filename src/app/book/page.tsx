import { redirect } from "next/navigation";

// Booking is now part of the combined /connect page.
export default function BookRedirect() {
  redirect("/connect");
}
