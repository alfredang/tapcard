// WhatsApp deep-link helpers. wa.me requires a digits-only international number.

function normalizePhone(input?: string | null) {
  if (!input) return "";
  return input.replace(/[^0-9]/g, "");
}

export function whatsappLink(phone?: string | null, message?: string) {
  const num = normalizePhone(phone);
  if (!num) return "";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
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
  connect: (name?: string, opts?: { company?: string | null; linkedin?: string | null; cardUrl?: string }) => {
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

export function telLink(phone?: string | null) {
  if (!phone) return "";
  return `tel:${phone.replace(/[^0-9+]/g, "")}`;
}
