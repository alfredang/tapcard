import { NextResponse } from "next/server";
import { z } from "zod";
import { getMobileUserId } from "@/lib/mobile-auth";
import { rateLimit, tooManyRequests } from "@/lib/rate-limit";
import {
  generateBio,
  generateAbout,
  generateCompanyDescription,
  generateSalesPitch,
} from "@/lib/ai";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile AI text generation — token-based twin of /api/ai. Lets the native app
// draft a bio / about / company blurb / pitch for a card from a few fields.
// ─────────────────────────────────────────────────────────────────────────────

const schema = z.object({
  action: z.enum(["bio", "about", "company", "pitch"]),
  fullName: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cap expensive LLM calls per user.
  const limited = rateLimit(`ai:${userId}`, 20, 60_000); // 20 / min
  if (!limited.ok) return tooManyRequests(limited.retryAfterSec);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { action, fullName = "Professional", jobTitle, company } = parsed.data;
  const seed = { fullName, jobTitle, company };

  let text = "";
  switch (action) {
    case "bio":
      text = await generateBio(seed);
      break;
    case "about":
      text = await generateAbout(seed);
      break;
    case "company":
      text = await generateCompanyDescription(company || fullName);
      break;
    case "pitch":
      text = await generateSalesPitch(seed);
      break;
  }

  return NextResponse.json({ text });
}
