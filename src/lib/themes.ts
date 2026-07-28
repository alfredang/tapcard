// Card theme tokens. Each theme is a self-contained visual style applied to the
// public card and the live builder preview. Kept framework-agnostic (plain CSS
// values) so the same object drives both the editor preview and the public page.

export type ThemeKey =
  | "CORPORATE"
  | "MODERN"
  | "MINIMALIST"
  | "DARK"
  | "CREATIVE"
  | "LUXURY"
  | "OCEAN"
  | "FOREST"
  | "SUNSET"
  | "ROSE"
  | "INDIGO"
  | "TEAL"
  | "AMBER"
  | "CRIMSON"
  | "LAVENDER"
  | "MIDNIGHT"
  | "SKY"
  | "MINT"
  | "PEACH"
  | "GRAPHITE";

export interface ThemeTokens {
  key: ThemeKey;
  label: string;
  // Page / card background
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  // Text
  text: string;
  subtext: string;
  // Header band behind the avatar
  bannerGradient: string;
  // Action buttons
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  chipBg: string;
  // Accent used for icons / links (falls back to card.accentColor)
  accent: string;
  fontFamily: string;
  rounded: string;
}

export const THEMES: Record<ThemeKey, ThemeTokens> = {
  CORPORATE: {
    key: "CORPORATE",
    label: "Corporate",
    pageBg: "#eef2f9",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    text: "#0f172a",
    subtext: "#475569",
    bannerGradient: "linear-gradient(120deg, #1e3a8a, #2563eb)",
    buttonBg: "#1e3a8a",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#eff6ff",
    accent: "#2563eb",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "16px",
  },
  // The default theme. Light — matching the site's light-by-default redesign —
  // with the brand violet→coral gradient as the banner and primary button.
  MODERN: {
    key: "MODERN",
    label: "Modern",
    pageBg: "#f4f1fc",
    cardBg: "#ffffff",
    cardBorder: "#e4ddee",
    text: "#19112d",
    subtext: "#655c7a",
    bannerGradient: "linear-gradient(100deg, #6a47f5, #f86e59)",
    buttonBg: "linear-gradient(100deg, #6a47f5, #f86e59)",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#f7f4fb",
    accent: "#6a47f5",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "22px",
  },
  MINIMALIST: {
    key: "MINIMALIST",
    label: "Minimalist",
    pageBg: "#fafafa",
    cardBg: "#ffffff",
    cardBorder: "#ececec",
    text: "#111111",
    subtext: "#6b7280",
    bannerGradient: "linear-gradient(120deg, #f4f4f5, #e7e7ea)",
    buttonBg: "#111111",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#f4f4f5",
    accent: "#111111",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "14px",
  },
  DARK: {
    key: "DARK",
    label: "Dark",
    pageBg: "#050507",
    cardBg: "#0f0f14",
    cardBorder: "#23232c",
    text: "#f4f4f5",
    subtext: "#9ca3af",
    bannerGradient: "linear-gradient(120deg, #18181b, #2a2a35)",
    buttonBg: "#26262e",
    buttonText: "#ffffff",
    buttonBorder: "#34343f",
    chipBg: "#1a1a20",
    accent: "#22d3ee",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "18px",
  },
  CREATIVE: {
    key: "CREATIVE",
    label: "Creative",
    pageBg: "#fff7ed",
    cardBg: "#ffffff",
    cardBorder: "#fed7aa",
    text: "#431407",
    subtext: "#9a3412",
    bannerGradient: "linear-gradient(120deg, #fb7185, #f59e0b)",
    buttonBg: "linear-gradient(120deg, #fb7185, #f59e0b)",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#fff1e6",
    accent: "#ea580c",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "26px",
  },
  LUXURY: {
    key: "LUXURY",
    label: "Luxury",
    pageBg: "#0a0a0a",
    cardBg: "#121212",
    cardBorder: "#3a2f1a",
    text: "#f7efe0",
    subtext: "#c9b890",
    bannerGradient: "linear-gradient(120deg, #1a1407, #3a2f1a)",
    buttonBg: "linear-gradient(120deg, #c9a227, #f0d27a)",
    buttonText: "#0a0a0a",
    buttonBorder: "transparent",
    chipBg: "#1c1710",
    accent: "#d4af37",
    fontFamily: "var(--font-sans), system-ui, serif",
    rounded: "16px",
  },
  OCEAN: {
    key: "OCEAN",
    label: "Ocean",
    pageBg: "#eef7fb",
    cardBg: "#ffffff",
    cardBorder: "#d3e7f2",
    text: "#0c2a3a",
    subtext: "#4a6b7e",
    bannerGradient: "linear-gradient(110deg, #0891b2, #2563eb)",
    buttonBg: "linear-gradient(110deg, #0891b2, #2563eb)",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#e6f4f9",
    accent: "#0e7490",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "20px",
  },
  FOREST: {
    key: "FOREST",
    label: "Forest",
    pageBg: "#f0f7f1",
    cardBg: "#ffffff",
    cardBorder: "#d5e8d8",
    text: "#122b18",
    subtext: "#4c6b53",
    bannerGradient: "linear-gradient(110deg, #166534, #22c55e)",
    buttonBg: "#166534",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#e8f5ea",
    accent: "#16a34a",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "18px",
  },
  SUNSET: {
    key: "SUNSET",
    label: "Sunset",
    pageBg: "#fef3ee",
    cardBg: "#ffffff",
    cardBorder: "#fbdccb",
    text: "#3b1408",
    subtext: "#8a5540",
    bannerGradient: "linear-gradient(110deg, #f97316, #ec4899)",
    buttonBg: "linear-gradient(110deg, #f97316, #ec4899)",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#feeee4",
    accent: "#ea580c",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "24px",
  },
  ROSE: {
    key: "ROSE",
    label: "Rose",
    pageBg: "#fdf1f4",
    cardBg: "#ffffff",
    cardBorder: "#f8d7de",
    text: "#3f0d1a",
    subtext: "#8b4a5c",
    bannerGradient: "linear-gradient(110deg, #e11d48, #fb7185)",
    buttonBg: "#e11d48",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#fcebef",
    accent: "#e11d48",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "22px",
  },
  INDIGO: {
    key: "INDIGO",
    label: "Indigo",
    pageBg: "#f0f1fc",
    cardBg: "#ffffff",
    cardBorder: "#dcdef5",
    text: "#171a3d",
    subtext: "#565a85",
    bannerGradient: "linear-gradient(110deg, #4338ca, #818cf8)",
    buttonBg: "#4338ca",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#eaebfa",
    accent: "#4f46e5",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "18px",
  },
  TEAL: {
    key: "TEAL",
    label: "Teal",
    pageBg: "#edf8f6",
    cardBg: "#ffffff",
    cardBorder: "#cfeae4",
    text: "#0b2f29",
    subtext: "#42685f",
    bannerGradient: "linear-gradient(110deg, #0d9488, #2dd4bf)",
    buttonBg: "#0d9488",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#e4f4f1",
    accent: "#0d9488",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "20px",
  },
  AMBER: {
    key: "AMBER",
    label: "Amber",
    pageBg: "#fdf6ea",
    cardBg: "#ffffff",
    cardBorder: "#f6e2bd",
    text: "#3d2705",
    subtext: "#8a6a33",
    bannerGradient: "linear-gradient(110deg, #d97706, #fbbf24)",
    buttonBg: "#d97706",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#fbf0da",
    accent: "#d97706",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "18px",
  },
  CRIMSON: {
    key: "CRIMSON",
    label: "Crimson",
    pageBg: "#fcf1f1",
    cardBg: "#ffffff",
    cardBorder: "#f5d5d5",
    text: "#3c0d0d",
    subtext: "#8a4a4a",
    bannerGradient: "linear-gradient(110deg, #b91c1c, #ef4444)",
    buttonBg: "#b91c1c",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#fae9e9",
    accent: "#dc2626",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "16px",
  },
  LAVENDER: {
    key: "LAVENDER",
    label: "Lavender",
    pageBg: "#f7f3fd",
    cardBg: "#ffffff",
    cardBorder: "#e9def7",
    text: "#2a1745",
    subtext: "#6d5a8c",
    bannerGradient: "linear-gradient(110deg, #a78bfa, #f0abfc)",
    buttonBg: "#8b5cf6",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#f2ebfb",
    accent: "#8b5cf6",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "24px",
  },
  MIDNIGHT: {
    key: "MIDNIGHT",
    label: "Midnight",
    pageBg: "#080e1a",
    cardBg: "#0f172a",
    cardBorder: "#243146",
    text: "#e8eef8",
    subtext: "#93a5bf",
    bannerGradient: "linear-gradient(110deg, #1e293b, #0ea5e9)",
    buttonBg: "#0ea5e9",
    buttonText: "#06121f",
    buttonBorder: "transparent",
    chipBg: "#1a2436",
    accent: "#38bdf8",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "20px",
  },
  SKY: {
    key: "SKY",
    label: "Sky",
    pageBg: "#eff8fe",
    cardBg: "#ffffff",
    cardBorder: "#d4ebfa",
    text: "#0b2940",
    subtext: "#48708c",
    bannerGradient: "linear-gradient(110deg, #0284c7, #38bdf8)",
    buttonBg: "#0284c7",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#e6f4fd",
    accent: "#0284c7",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "22px",
  },
  MINT: {
    key: "MINT",
    label: "Mint",
    pageBg: "#eefaf4",
    cardBg: "#ffffff",
    cardBorder: "#d2efe0",
    text: "#0d2f21",
    subtext: "#47705d",
    bannerGradient: "linear-gradient(110deg, #10b981, #6ee7b7)",
    buttonBg: "#10b981",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#e5f7ee",
    accent: "#10b981",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "24px",
  },
  PEACH: {
    key: "PEACH",
    label: "Peach",
    pageBg: "#fef4ef",
    cardBg: "#ffffff",
    cardBorder: "#fbdfd0",
    text: "#3d1c0d",
    subtext: "#8a5f4a",
    bannerGradient: "linear-gradient(110deg, #fb923c, #fda4af)",
    buttonBg: "#f97316",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "#fdeee5",
    accent: "#f97316",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "26px",
  },
  GRAPHITE: {
    key: "GRAPHITE",
    label: "Graphite",
    pageBg: "#101012",
    cardBg: "#18181b",
    cardBorder: "#2e2e33",
    text: "#f4f4f5",
    subtext: "#a1a1aa",
    bannerGradient: "linear-gradient(110deg, #27272a, #52525b)",
    buttonBg: "#f4f4f5",
    buttonText: "#18181b",
    buttonBorder: "transparent",
    chipBg: "#232327",
    accent: "#d4d4d8",
    fontFamily: "var(--font-sans), system-ui, sans-serif",
    rounded: "16px",
  },
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(key?: string | null): ThemeTokens {
  return THEMES[(key as ThemeKey) ?? "MODERN"] ?? THEMES.MODERN;
}
