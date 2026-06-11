import { NextResponse } from "next/server";
import { contactFormSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  // In production, forward to a CRM/email here. For now we log the inquiry so
  // the form is fully functional end-to-end.
  // eslint-disable-next-line no-console
  console.log("📥  Sales inquiry:", parsed.data);

  return NextResponse.json({ ok: true });
}
