import { NextResponse } from "next/server";
import { z } from "zod";
import { createOtp } from "@/lib/otp";

const schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }
  await createOtp(parsed.data.email);
  // In dev the code is printed to the server console.
  return NextResponse.json({ ok: true });
}
