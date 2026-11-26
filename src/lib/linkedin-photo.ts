import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Pull the owner's LinkedIn profile photo onto a card.
//
// LinkedIn keeps profile photos behind OAuth: a public profile page needs a
// login, so there is nothing to scrape. What works is "Sign In with LinkedIn
// using OpenID Connect": once the owner connects LinkedIn to their account
// (Auth.js links it to the signed-in user), the stored access token reads
// /v2/userinfo, whose `picture` is the profile photo.
//
// LinkedIn photo URLs (media.licdn.com/…?e=<expiry>) stop working after a
// while, so the image is downloaded and stored inline as a data URL — the
// same format the app and the web builder use for uploaded photos.
// ─────────────────────────────────────────────────────────────────────────────

export type LinkedInPhotoResult =
  | { ok: true; dataUrl: string }
  | { ok: false; status: number; error: string; connect?: boolean };

const MAX_BYTES = 2_000_000;

function isLinkedInImageHost(url: string) {
  try {
    const { protocol, hostname } = new URL(url);
    return protocol === "https:" && /(^|\.)licdn\.com$/i.test(hostname);
  } catch {
    return false;
  }
}

export async function fetchLinkedInPhoto(
  userId: string,
): Promise<LinkedInPhotoResult> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "linkedin" },
    select: { access_token: true, expires_at: true },
  });
  if (!account?.access_token) {
    return {
      ok: false,
      status: 409,
      connect: true,
      error: "Connect your LinkedIn account first.",
    };
  }
  if (account.expires_at && account.expires_at * 1000 < Date.now()) {
    return {
      ok: false,
      status: 409,
      connect: true,
      error: "Your LinkedIn connection has expired. Connect LinkedIn again.",
    };
  }

  const info = await fetch("https://api.linkedin.com/v2/userinfo", {
    headers: { Authorization: `Bearer ${account.access_token}` },
    cache: "no-store",
  }).catch(() => null);
  if (!info) {
    return { ok: false, status: 502, error: "LinkedIn could not be reached." };
  }
  if (info.status === 401 || info.status === 403) {
    return {
      ok: false,
      status: 409,
      connect: true,
      error: "Your LinkedIn connection has expired. Connect LinkedIn again.",
    };
  }
  if (!info.ok) {
    return { ok: false, status: 502, error: "LinkedIn did not return your profile." };
  }

  const { picture } = (await info.json().catch(() => ({}))) as {
    picture?: string;
  };
  if (!picture || !isLinkedInImageHost(picture)) {
    return {
      ok: false,
      status: 404,
      error: "Your LinkedIn profile has no photo to import.",
    };
  }

  const img = await fetch(picture, { cache: "no-store" }).catch(() => null);
  const type = img?.headers.get("content-type") || "";
  if (!img?.ok || !type.startsWith("image/")) {
    return { ok: false, status: 502, error: "Your LinkedIn photo could not be downloaded." };
  }
  const bytes = Buffer.from(await img.arrayBuffer());
  if (bytes.length === 0 || bytes.length > MAX_BYTES) {
    return { ok: false, status: 502, error: "Your LinkedIn photo is too large to import." };
  }
  return {
    ok: true,
    dataUrl: `data:${type.split(";")[0]};base64,${bytes.toString("base64")}`,
  };
}

/// Set a card's profile photo from the owner's LinkedIn. Ownership is checked.
export async function importLinkedInPhotoToCard(userId: string, cardId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    select: { userId: true },
  });
  if (!card || card.userId !== userId) {
    return { ok: false as const, status: 404, error: "Not found" };
  }
  const photo = await fetchLinkedInPhoto(userId);
  if (!photo.ok) return photo;
  const updated = await prisma.card.update({
    where: { id: cardId },
    data: { profilePhoto: photo.dataUrl },
  });
  return { ok: true as const, card: updated };
}
