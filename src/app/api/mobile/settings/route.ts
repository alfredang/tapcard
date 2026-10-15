import { NextResponse } from "next/server";
import { getMobileUserId } from "@/lib/mobile-auth";
import { getUserPrefs, updateUserPrefs } from "@/lib/user-prefs";

// ─────────────────────────────────────────────────────────────────────────────
// Mobile account preferences — token-based twin of /api/settings. The iOS
// Settings tab reads these on launch and PATCHes each change, so the web
// /settings page and the public card pick them up immediately.
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getUserPrefs(userId) });
}

export async function PATCH(req: Request) {
  const userId = getMobileUserId(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await updateUserPrefs(userId, await req.json().catch(() => null));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ settings: result.prefs });
}
