import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserId } from "@/lib/session";
import {
  generateBio,
  generateAbout,
  generateCompanyDescription,
  generateSalesPitch,
} from "@/lib/ai";

const schema = z.object({
  action: z.enum(["bio", "about", "company", "pitch"]),
  fullName: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
