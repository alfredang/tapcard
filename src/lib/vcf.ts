import type { Card } from "@prisma/client";

/** Escape a value for vCard 3.0 (commas, semicolons, newlines). */
function esc(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Build a vCard 3.0 string from a Card. 3.0 is the most broadly compatible
 * format across iPhone, Android, Google and Outlook contacts.
 */
export function cardToVCard(card: Card): string {
  const nameParts = card.fullName.trim().split(/\s+/);
  const last = nameParts.length > 1 ? nameParts.pop()! : "";
  const first = nameParts.join(" ");

  const lines: string[] = ["BEGIN:VCARD", "VERSION:3.0"];

  lines.push(`N:${esc(last)};${esc(first)};;;`);
  lines.push(`FN:${esc(card.fullName)}`);
  if (card.company) lines.push(`ORG:${esc(card.company)}`);
  if (card.jobTitle) lines.push(`TITLE:${esc(card.jobTitle)}`);
  if (card.mobile) lines.push(`TEL;TYPE=CELL:${esc(card.mobile)}`);
  if (card.officePhone) lines.push(`TEL;TYPE=WORK:${esc(card.officePhone)}`);
  if (card.whatsapp) lines.push(`TEL;TYPE=WHATSAPP:${esc(card.whatsapp)}`);
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(card.email)}`);
  if (card.website) lines.push(`URL:${esc(card.website)}`);
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${esc(card.address)};;;;`);
  if (card.bio) lines.push(`NOTE:${esc(card.bio)}`);
  if (card.profilePhoto)
    lines.push(`PHOTO;VALUE=URI:${esc(card.profilePhoto)}`);

  // Social profiles
  const socials: [string, string | null][] = [
    ["LinkedIn", card.linkedin],
    ["Facebook", card.facebook],
    ["Instagram", card.instagram],
    ["Twitter", card.twitter],
    ["YouTube", card.youtube],
    ["Telegram", card.telegram],
    ["TikTok", card.tiktok],
  ];
  for (const [label, url] of socials) {
    if (url)
      lines.push(`X-SOCIALPROFILE;TYPE=${label}:${esc(url)}`);
  }

  lines.push("END:VCARD");
  return lines.join("\r\n");
}

export function vcfFilename(card: Card) {
  const safe = card.fullName.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
  return `${safe || "contact"}.vcf`;
}
