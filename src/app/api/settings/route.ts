import { NextResponse } from "next/server";
import { getUserId } from "@/lib/session";
import { getUserPrefs, updateUserPrefs } from "@/lib/user-prefs";

// Web account preferences (session cookie). Same data as /api/mobile/settings.

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getUserPrefs(userId) });
}

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const result = await updateUserPrefs(userId, await req.json().catch(() => null));
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ settings: result.prefs });
}
