// WhatsApp deep-link helpers. wa.me requires a digits-only international number.

export function normalizePhone(input?: string | null) {
  if (!input) return "";
  return input.replace(/[^0-9]/g, "");
}

export function whatsappLink(phone?: string | null, message?: string) {
  const num = normalizePhone(phone);
  if (!num) return "";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const WHATSAPP_PRESETS = {
  message: (name?: string) =>
    `Hi${name ? ` ${name}` : ""}, I came across your digital business card and would love to connect.`,
  quote: (name?: string) =>
    `Hi${name ? ` ${name}` : ""}, I'd like to request a quote. Could you share more details?`,
  support: (name?: string) =>
    `Hi${name ? ` ${name}` : ""}, I need some help/support. Are you available?`,
  share: (url: string, name?: string) =>
    `Check out ${name ? `${name}'s` : "this"} digital business card: ${url}`,
};

export function mailtoLink(email?: string | null, subject?: string) {
  if (!email) return "";
  return subject
    ? `mailto:${email}?subject=${encodeURIComponent(subject)}`
    : `mailto:${email}`;
}

export function telLink(phone?: string | null) {
  if (!phone) return "";
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
