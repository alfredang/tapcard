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
  introVideo?: string | null;

  theme?: string | null;
  accentColor?: string | null;
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
