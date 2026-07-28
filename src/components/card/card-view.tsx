"use client";

import type { ComponentType, ReactNode } from "react";
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  UserPlus,
  MapPin,
} from "lucide-react";
import { getTheme } from "@/lib/themes";
import { activeSocials, type CardData, type SocialKey } from "@/lib/card";
import { whatsappLink, telLink, mailtoLink, WHATSAPP_PRESETS } from "@/lib/whatsapp";
import { initials } from "@/lib/utils";
import {
  LinkedInIcon,
  XIcon,
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TikTokIcon,
  TelegramIcon,
} from "@/components/icons/brand";

type IconType = ComponentType<{ className?: string }>;

const SOCIAL_ICONS: Record<SocialKey, IconType> = {
  linkedin: LinkedInIcon,
  twitter: XIcon,
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTubeIcon,
  telegram: TelegramIcon,
  tiktok: TikTokIcon,
};

const SOCIAL_LABELS: Record<SocialKey, string> = {
  linkedin: "Connect with me on LinkedIn",
  twitter: "Follow me on X",
  instagram: "Follow me on Instagram",
  facebook: "Find me on Facebook",
  youtube: "Watch me on YouTube",
  telegram: "Message me on Telegram",
  tiktok: "Follow me on TikTok",
};

type TrackFn = (type: string, meta?: Record<string, string>) => void;

// ─────────────────────────────────────────────────────────────────────────────
// Blinq-style card: banner → avatar overlapping it → left-aligned identity
// block → one contact detail per row (round icon chip + value) → full-width
// Save Contact. Long values wrap inside their row instead of fighting a grid.
// ─────────────────────────────────────────────────────────────────────────────

export function CardView({
  card,
  vcfHref,
  onTrack,
  scale = 1,
}: {
  card: CardData;
  vcfHref?: string;
  onTrack?: TrackFn;
  /** visual scale for the compact builder preview */
  scale?: number;
}) {
  const t = getTheme(card.theme);
  const accent = card.accentColor || t.accent;
  const socials = activeSocials(card);

  const ext = (href: string) =>
    href.startsWith("http") ? href : `https://${href}`;

  /** Hostname-ish display text for a URL, so rows stay short and readable. */
  const pretty = (url: string) =>
    url.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");

  const phone = card.mobile || card.officePhone;

  return (
    <div
      className="mx-auto w-full max-w-sm overflow-hidden"
      style={{
        background: t.cardBg,
        color: t.text,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.rounded,
        fontFamily: t.fontFamily,
        boxShadow: "0 30px 60px -20px rgba(25,17,45,0.25)",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* Banner */}
      <div className="relative h-32 w-full" style={{ background: t.bannerGradient }}>
        {card.coverBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.coverBanner}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {card.companyLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.companyLogo}
            alt="logo"
            className="absolute right-4 top-4 h-11 w-11 rounded-lg bg-white/95 object-contain p-1.5 shadow"
          />
        )}
      </div>

      {/* Identity — `relative` so the avatar paints ABOVE the (positioned)
          banner; without it the banner covers the avatar's top half. */}
      <div className="relative z-10 -mt-12 px-6">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white shadow-lg"
          style={{ background: accent, boxShadow: `0 0 0 4px ${t.cardBg}` }}
        >
          {card.profilePhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.profilePhoto}
              alt={card.fullName}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{initials(card.fullName)}</span>
          )}
        </div>

        <h1 className="mt-3 break-words text-2xl font-bold leading-tight">
          {card.fullName || "Your Name"}
        </h1>
        {card.jobTitle && (
          <p className="mt-1 break-words text-sm" style={{ color: t.subtext }}>
            {card.jobTitle}
          </p>
        )}
        {(card.company || card.department) && (
          <p className="break-words text-sm" style={{ color: t.subtext }}>
            {card.company}
            {card.company && card.department ? " · " : ""}
            {card.department}
          </p>
        )}
        {card.tagline && (
          <p className="mt-2 break-words text-sm italic" style={{ color: accent }}>
            “{card.tagline}”
          </p>
        )}
        {card.bio && (
          <p className="mt-2 break-words text-sm leading-relaxed" style={{ color: t.subtext }}>
            {card.bio}
          </p>
        )}
      </div>

      {/* Contact rows — one detail per line, Blinq-style */}
      <div className="mt-5 flex flex-col gap-1 px-4">
        {phone && (
          <Row
            icon={Phone}
            href={telLink(phone)}
            onClick={() => onTrack?.("PHONE_CLICK")}
            theme={t}
            accent={accent}
          >
            {phone}
          </Row>
        )}
        {card.email && (
          <Row
            icon={Mail}
            href={mailtoLink(card.email)}
            onClick={() => onTrack?.("EMAIL_CLICK")}
            theme={t}
            accent={accent}
          >
            {card.email}
          </Row>
        )}
        {card.whatsapp && (
          <Row
            icon={MessageCircle}
            href={whatsappLink(card.whatsapp, WHATSAPP_PRESETS.message(card.fullName))}
            external
            onClick={() => onTrack?.("WHATSAPP_CLICK")}
            theme={t}
            accent={accent}
          >
            WhatsApp
          </Row>
        )}
        {card.website && (
          <Row
            icon={Globe}
            href={ext(card.website)}
            external
            onClick={() => onTrack?.("WEBSITE_CLICK")}
            theme={t}
            accent={accent}
          >
            {pretty(card.website)}
          </Row>
        )}
        {socials.map((s) => {
          const Icon = SOCIAL_ICONS[s.key];
          return (
            <Row
              key={s.key}
              icon={Icon}
              href={ext(s.url)}
              external
              onClick={() => onTrack?.("SOCIAL_CLICK", { platform: s.key })}
              theme={t}
              accent={accent}
            >
              {SOCIAL_LABELS[s.key]}
            </Row>
          );
        })}
        {card.address && (
          <Row icon={MapPin} theme={t} accent={accent}>
            {card.address}
          </Row>
        )}
      </div>

      {/* About */}
      {card.about && (
        <div className="mt-4 px-6">
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color: accent }}
          >
            About
          </p>
          <p className="break-words text-sm leading-relaxed" style={{ color: t.subtext }}>
            {card.about}
          </p>
        </div>
      )}

      {/* Save Contact — the card's one big call-to-action */}
      {vcfHref && (
        <div className="px-6 pt-5">
          <a
            href={vcfHref}
            download
            onClick={() => onTrack?.("VCF_DOWNLOAD")}
            className="flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold shadow-lg transition active:scale-[0.98]"
            style={{
              background: t.buttonBg,
              color: t.buttonText,
              border: `1px solid ${t.buttonBorder}`,
            }}
          >
            <UserPlus className="h-4 w-4" /> Save Contact
          </a>
        </div>
      )}

      <div className="mt-5 pb-5 text-center text-[11px]" style={{ color: t.subtext }}>
        Powered by{" "}
        <a
          href="/?ref=card"
          target="_blank"
          rel="noopener"
          style={{ color: accent }}
          className="font-semibold hover:underline"
        >
          Tapcard
        </a>
      </div>
    </div>
  );
}

/** One contact detail: round icon chip + value that wraps within its row. */
function Row({
  icon: Icon,
  href,
  external,
  onClick,
  theme,
  accent,
  children,
}: {
  icon: IconType;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  theme: ReturnType<typeof getTheme>;
  accent: string;
  children: ReactNode;
}) {
  const inner = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: theme.chipBg, color: accent }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 break-words text-sm font-medium">{children}</span>
    </>
  );

  const className =
    "flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-black/[0.03] active:scale-[0.99]";

  if (!href) {
    return <div className={className}>{inner}</div>;
  }
  return (
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={className}
    >
      {inner}
    </a>
  );
}
