import { endSession, noStore } from "@/lib/vkmRequests";

export async function POST() {
  await endSession();
  return noStore({ ok: true });
}
