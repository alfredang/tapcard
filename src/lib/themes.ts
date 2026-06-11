// Card theme tokens. Each theme is a self-contained visual style applied to the
// public card and the live builder preview. Kept framework-agnostic (plain CSS
// values) so the same object drives both the editor preview and the public page.

export type ThemeKey =
  | "CORPORATE"
  | "MODERN"
  | "MINIMALIST"
  | "DARK"
  | "CREATIVE"
  | "LUXURY";

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
  MODERN: {
    key: "MODERN",
    label: "Modern",
    pageBg: "#0b1020",
    cardBg: "rgba(20,26,46,0.85)",
    cardBorder: "rgba(124,92,255,0.28)",
    text: "#f5f7ff",
    subtext: "#aab2d5",
    bannerGradient: "linear-gradient(120deg, #7c5cff, #c44bff)",
    buttonBg: "linear-gradient(120deg, #7c5cff, #c44bff)",
    buttonText: "#ffffff",
    buttonBorder: "transparent",
    chipBg: "rgba(124,92,255,0.14)",
    accent: "#9b87ff",
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
};

export const THEME_LIST = Object.values(THEMES);

export function getTheme(key?: string | null): ThemeTokens {
  return THEMES[(key as ThemeKey) ?? "MODERN"] ?? THEMES.MODERN;
}
