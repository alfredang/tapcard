import { z } from "zod";
import { prisma } from "@/lib/db";

// ─────────────────────────────────────────────────────────────────────────────
// Account preferences shared by the iOS app (Settings tab) and the web
// (/settings). Mobile-first: the app is where most people change these, and
// both sides read and write the same User columns, so a change on either
// shows up on the other on next load.
// ─────────────────────────────────────────────────────────────────────────────

export const QR_MODES = ["WHATSAPP", "LINKEDIN", "CARD"] as const;
export type QrModeKey = (typeof QR_MODES)[number];

export interface UserPrefs {
  /// Default dialling code, digits only ("65").
  countryCode: string;
  /// What the card's QR opens by default.
  qrMode: QrModeKey;
  /// The owner's WhatsApp contact link ("https://wa.me/qr/…"), or "" when
  /// unset. When set, the WhatsApp QR adds them as a contact, exactly like
  /// the code in WhatsApp → QR code.
  whatsappQr: string;
}

/// Pull a WhatsApp contact link out of whatever was pasted — WhatsApp's share
/// text wraps it in a sentence — as "https://wa.me/qr/<code>". Null when the
/// text holds none.
export function whatsappQrLink(text: string): string | null {
  const m = text.match(/(?:wa\.me|api\.whatsapp\.com)\/qr\/([A-Za-z0-9]+)/i);
  return m ? `https://wa.me/qr/${m[1]}` : null;
}

export const prefsSchema = z
  .object({
    countryCode: z
      .string()
      .trim()
      .transform((v) => v.replace(/^\+/, ""))
      .pipe(z.string().regex(/^[1-9]\d{0,3}$/, "Use a dialling code like 65")),
    qrMode: z.enum(QR_MODES),
    // "" clears it.
    whatsappQr: z
      .string()
      .trim()
      .transform((v, ctx) => {
        if (!v) return "";
        const link = whatsappQrLink(v);
        if (!link) {
          ctx.addIssue({
            code: "custom",
            message: "Paste the wa.me/qr link from WhatsApp → QR code",
          });
          return z.NEVER;
        }
        return link;
      }),
  })
  .partial();

const select = { countryCode: true, qrMode: true, whatsappQr: true } as const;

function normalize(row: {
  countryCode: string;
  qrMode: string;
  whatsappQr: string;
}): UserPrefs {
  return {
    countryCode: row.countryCode || "65",
    qrMode: (QR_MODES as readonly string[]).includes(row.qrMode)
      ? (row.qrMode as QrModeKey)
      : "WHATSAPP",
    whatsappQr: row.whatsappQr || "",
  };
}

export async function getUserPrefs(userId: string): Promise<UserPrefs> {
  const row = await prisma.user.findUnique({ where: { id: userId }, select });
  return normalize(row ?? { countryCode: "65", qrMode: "WHATSAPP", whatsappQr: "" });
}

/// Validate and apply a partial update. Returns the saved prefs, or an error
/// message for a 400.
export async function updateUserPrefs(
  userId: string,
  body: unknown,
): Promise<{ prefs: UserPrefs } | { error: string }> {
  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const row = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
    select,
  });
  return { prefs: normalize(row) };
}
