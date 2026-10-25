import crypto from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { devObjectFile, devSign, devStoreEnabled } from "@/lib/vkmRequests";

// Stand-in for Supabase signed upload/download URLs during local testing
// (next dev + VKM_DEV_STORE=1). Answers 404 everywhere else.
function verify(req: Request, kind: string): string | null {
  if (!devStoreEnabled()) return null;
  const u = new URL(req.url);
  const p = u.searchParams.get("path") || "";
  const exp = Number(u.searchParams.get("exp") || 0);
  const sig = u.searchParams.get("sig") || "";
  if (u.searchParams.get("kind") !== kind || !p || exp < Date.now()) return null;
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(devSign(p, kind, exp), "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b) ? p : null;
}

export async function PUT(req: Request) {
  const p = verify(req, "put");
  if (!p) return new Response("not found", { status: 404 });
  const file = devObjectFile(p);
  if (await fs.stat(file).then(() => true, () => false)) return new Response("exists", { status: 409 });
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, Buffer.from(await req.arrayBuffer()));
  return Response.json({ Key: p });
}

export async function GET(req: Request) {
  const p = verify(req, "get");
  if (!p) return new Response("not found", { status: 404 });
  const data = await fs.readFile(devObjectFile(p)).catch(() => null);
  if (!data) return new Response("not found", { status: 404 });
  return new Response(data, { headers: { "content-type": "application/octet-stream" } });
}
