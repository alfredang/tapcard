// WhatsApp deep-link helpers. wa.me requires a digits-only *international*
// number — "96983731" alone makes WhatsApp reply "couldn't look up phone
// number … missing a country code". People type local numbers on their cards,
// so every link goes through internationalDigits() with the owner's default
// country code (User.countryCode, edited in the app's Settings).
//
// Keep in sync with the iOS app's PhoneNumber.internationalDigits.

export const DEFAULT_COUNTRY_CODE = "65";

/// National significant-number lengths for the dialling codes people pick
/// most. Lets us tell "6588666375" (SG number already carrying 65) from
/// "9123456789" (an Indian local number that merely starts with 91).
const NATIONAL_LENGTHS: Record<string, [number, number]> = {
  "1": [10, 10], // US / CA
  "44": [9, 10], // UK
  "60": [8, 10], // MY
  "61": [9, 9], // AU
  "62": [8, 12], // ID
  "63": [10, 10], // PH
  "65": [8, 8], // SG
  "66": [8, 9], // TH
  "81": [9, 10], // JP
  "82": [8, 10], // KR
  "84": [9, 10], // VN
  "86": [11, 11], // CN
  "91": [10, 10], // IN
  "852": [8, 8], // HK
  "853": [8, 8], // MO
  "886": [9, 9], // TW
  "971": [8, 9], // AE
};

/// Digits-only international form of a phone number, e.g.
/// "9698 3731" → "6596983731", "+60 12-345 6789" → "60123456789",
/// "012-345 6789" (MY trunk 0) with cc 60 → "60123456789".
export function internationalDigits(
  input?: string | null,
  countryCode: string | null = DEFAULT_COUNTRY_CODE,
) {
  const raw = (input || "").trim();
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (raw.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  const cc =
    (countryCode || DEFAULT_COUNTRY_CODE).replace(/\D/g, "") ||
    DEFAULT_COUNTRY_CODE;
  if (digits.startsWith("0")) return cc + digits.replace(/^0+/, "");
  const [min, max] = NATIONAL_LENGTHS[cc] ?? [7, 12];
  const fits = (n: number) => n >= min && n <= max;
  if (
    digits.startsWith(cc) &&
    fits(digits.length - cc.length) &&
    !fits(digits.length)
  ) {
    return digits;
  }
  return cc + digits;
}

/// "+6596983731" — for tel: links and vCards, so a contact saved abroad dials.
export function internationalPhone(
  input?: string | null,
  countryCode?: string | null,
) {
  const digits = internationalDigits(input, countryCode);
  return digits ? `+${digits}` : "";
}

export function whatsappLink(
  phone?: string | null,
  message?: string,
  countryCode?: string | null,
) {
  const num = internationalDigits(phone, countryCode);
  if (!num) return "";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/// The number a card is reached on over WhatsApp: the WhatsApp field, else
/// mobile, else the office line. Matches the iOS app's WhatsAppLink.number.
export function whatsappNumber(card: {
  whatsapp?: string | null;
  mobile?: string | null;
  officePhone?: string | null;
}) {
  return card.whatsapp || card.mobile || card.officePhone || "";
}

/// Normalise a LinkedIn field into a full profile URL — people type a bare
/// handle, "linkedin.com/in/…", or the complete link.
export function linkedinUrl(raw?: string | null) {
  const value = (raw || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.toLowerCase().includes("linkedin.com")) return `https://${value}`;
  const handle = value.replace(/^in\//, "");
  return `https://www.linkedin.com/in/${handle}`;
}

export const WHATSAPP_PRESETS = {
  message: (name?: string) =>
    `Hi${name ? ` ${name}` : ""}, I came across your digital business card and would love to connect.`,
  /// The intro a QR scanner sends: who they met, plus the links worth keeping,
  /// so the chat itself carries the contact details.
  connect: (
    name?: string,
    opts?: {
      company?: string | null;
      linkedin?: string | null;
      cardUrl?: string;
    },
  ) => {
    let text = `Hi${name ? ` ${name}` : ""}, I scanned your Tapcard`;
    if (opts?.company) text += ` at ${opts.company}`;
    text += " — I'd like to connect.";
    const li = linkedinUrl(opts?.linkedin);
    if (li) text += `\n\nLinkedIn: ${li}`;
    if (opts?.cardUrl) text += `\nCard: ${opts.cardUrl}`;
    return text;
  },
  share: (url: string, name?: string) =>
    `Check out ${name ? `${name}'s` : "this"} digital business card: ${url}`,
};

export function mailtoLink(email?: string | null, subject?: string) {
  if (!email) return "";
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}

export function telLink(phone?: string | null, countryCode?: string | null) {
  const intl = internationalPhone(phone, countryCode);
  return intl ? `tel:${intl}` : "";
}
