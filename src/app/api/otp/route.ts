import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/otp";
import { rateLimit, clientIp, tooManyRequests } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const ip = clientIp(req);
  const byIp = rateLimit(`otp:req:ip:${ip}`, 15, 10 * 60_000);
  if (!byIp.ok) return tooManyRequests(byIp.retryAfterSec);
  const byEmail = rateLimit(`otp:req:email:${email}`, 5, 10 * 60_000);
  if (!byEmail.ok) return tooManyRequests(byEmail.retryAfterSec);

  await createOtp(parsed.data.email);
  // In dev the code is printed to the server console.
  return NextResponse.json({ ok: true });
}
