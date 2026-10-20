// Shared card shape used by the live builder preview and the public page.
// It's a structural subset of the Prisma Card so both a live form state object
// and a persisted record satisfy it.

export interface CardData {
  id?: string;
  slug?: string;
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  department?: string | null;
  bio?: string | null;
  about?: string | null;
  tagline?: string | null;

  mobile?: string | null;
  officePhone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;

  linkedin?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  tiktok?: string | null;
  twitter?: string | null;
  telegram?: string | null;
  youtube?: string | null;

  profilePhoto?: string | null;
  companyLogo?: string | null;
  coverBanner?: string | null;

  theme?: string | null;
  accentColor?: string | null;

  /// The owner's default dialling code (User.countryCode) — turns local
  /// numbers into wa.me / tel: links that work. Not a Card column.
  countryCode?: string | null;
}

/// The accent a card renders with. Empty — or one of the two violets the
/// web builder and the iOS app used to stamp on every new card — means
/// "match the design", so a theme's own accent shows unless the owner picked
/// a colour on purpose. Mirrors the iOS app's BusinessCard.resolvedAccentHex.
const LEGACY_DEFAULT_ACCENTS = new Set(["#7c5cff", "#6a47f5"]);
export function resolveAccent(
  accentColor: string | null | undefined,
  themeAccent: string,
) {
  const value = (accentColor || "").trim().toLowerCase();
  return !value || LEGACY_DEFAULT_ACCENTS.has(value)
    ? themeAccent
    : accentColor!;
}

/// Whether dark text reads better than white on a hex colour (relative
/// luminance above ~0.55), for accents the owner picks freely. Mirrors the
/// iOS app's Color.isLight(hex:).
export function isLightColor(hex: string) {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.replace(/./g, "$&$&");
  if (!/^[0-9a-f]{6}$/i.test(h)) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.55;
}

export type SocialKey =
  | "linkedin"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "twitter"
  | "telegram"
  | "youtube";

export const SOCIALS: { key: SocialKey; label: string }[] = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "twitter", label: "X (Twitter)" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "telegram", label: "Telegram" },
];

export function activeSocials(card: CardData) {
  return SOCIALS.filter((s) => Boolean(card[s.key])).map((s) => ({
    ...s,
    url: card[s.key] as string,
  }));
}

/** Whether the card has the minimum content to look complete. */
export function cardCompleteness(card: CardData): number {
  const fields = [
    card.fullName,
    card.jobTitle,
    card.company,
    card.bio,
    card.mobile || card.whatsapp,
    card.email,
    card.website,
    card.profilePhoto,
    activeSocials(card).length > 0 ? "x" : "",
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
