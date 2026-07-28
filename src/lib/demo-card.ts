import type { CardData } from "@/lib/card";

/**
 * Demo personas for marketing/theme previews — photoreal mock portraits
 * (randomuser.me, mixed genders) and scenic banner images (picsum.photos)
 * so showcase cards look like real profiles rather than flat colours.
 */

const persona = (
  fullName: string,
  jobTitle: string,
  company: string,
  tagline: string,
  bio: string,
  portrait: string,
  bannerId: number,
): CardData => ({
  fullName,
  jobTitle,
  company,
  tagline,
  bio,
  mobile: "+14155550142",
  whatsapp: "+14155550142",
  email: `${fullName.split(" ")[0].toLowerCase()}@${company.replace(/\s+/g, "").toLowerCase()}.com`,
  website: `https://${company.replace(/\s+/g, "").toLowerCase()}.com`,
  linkedin: "https://linkedin.com/in/demo",
  instagram: "https://instagram.com/demo",
  profilePhoto: `https://randomuser.me/api/portraits/${portrait}.jpg`,
  coverBanner: `https://picsum.photos/id/${bannerId}/900/360`,
  theme: "MODERN",
  accentColor: "#6a47f5",
});

export const demoPersonas: CardData[] = [
  persona(
    "Jordan Avery", "Founder & Principal", "Avery Growth",
    "Turning ambitious goals into results.",
    "I help founders scale revenue with sharp positioning.",
    "men/32", 1050,
  ),
  persona(
    "Sophie Tan", "SVP, Product Strategy", "Better Connected",
    "Products people actually love.",
    "15 years shipping consumer products across APAC.",
    "women/44", 1015,
  ),
  persona(
    "Marcus Lee", "Real Estate Advisor", "Skyline Realty",
    "Your home, the right way.",
    "Top-1% agent for landed property and new launches.",
    "men/75", 1041,
  ),
  persona(
    "Priya Sharma", "Financial Consultant", "Lumen Wealth",
    "Clarity for every portfolio.",
    "Helping families plan, protect and grow their wealth.",
    "women/68", 1035,
  ),
  persona(
    "Daniel Wong", "Creative Director", "Studio North",
    "Design that does the talking.",
    "Brand systems and campaigns for teams that move fast.",
    "men/11", 1069,
  ),
  persona(
    "Aisha Rahman", "Corporate Trainer", "BrightPath Academy",
    "Skills that stick.",
    "Workshops on leadership, sales and communication.",
    "women/21", 429,
  ),
];

/** The default sample card (kept for existing call sites). */
export const demoCard: CardData = demoPersonas[0];
