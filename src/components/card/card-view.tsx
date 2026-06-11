"use client";

import type { ComponentType } from "react";
import {
  Phone,
  Mail,
  Globe,
  MessageCircle,
  UserPlus,
  MapPin,
  type LucideIcon,
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

type TrackFn = (type: string, meta?: Record<string, string>) => void;

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

  const actions: {
    label: string;
    icon: LucideIcon;
    href?: string;
    track: string;
    show: boolean;
    download?: boolean;
  }[] = [
    {
      label: "Save Contact",
      icon: UserPlus,
      href: vcfHref,
      track: "VCF_DOWNLOAD",
      show: Boolean(vcfHref),
      download: true,
    },
    {
      label: "Call",
      icon: Phone,
      href: telLink(card.mobile || card.officePhone),
      track: "PHONE_CLICK",
      show: Boolean(card.mobile || card.officePhone),
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      href: whatsappLink(card.whatsapp, WHATSAPP_PRESETS.message(card.fullName)),
      track: "WHATSAPP_CLICK",
      show: Boolean(card.whatsapp),
    },
    {
      label: "Email",
      icon: Mail,
      href: mailtoLink(card.email),
      track: "EMAIL_CLICK",
      show: Boolean(card.email),
    },
    {
      label: "Website",
      icon: Globe,
      href: card.website ? ext(card.website) : undefined,
      track: "WEBSITE_CLICK",
      show: Boolean(card.website),
    },
  ];
  const visibleActions = actions.filter((a) => a.show);

  return (
    <div
      className="mx-auto w-full max-w-sm overflow-hidden"
      style={{
        background: t.cardBg,
        color: t.text,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.rounded,
        fontFamily: t.fontFamily,
        boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45)",
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: "top center",
      }}
    >
      {/* Banner */}
      <div className="relative h-28 w-full" style={{ background: t.bannerGradient }}>
        {card.coverBanner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.coverBanner}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        {card.companyLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.companyLogo}
            alt="logo"
            className="absolute right-3 top-3 h-9 w-9 rounded-md bg-white/90 object-contain p-1"
          />
        )}
      </div>

      {/* Avatar */}
      <div className="-mt-12 flex flex-col items-center px-6 text-center">
        <div
          className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full text-2xl font-bold text-white shadow-lg ring-4"
          style={{ background: accent, borderColor: t.cardBg, boxShadow: `0 0 0 4px ${t.cardBg}` }}
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

        <h1 className="mt-3 text-xl font-bold leading-tight">
          {card.fullName || "Your Name"}
        </h1>
        {(card.jobTitle || card.company) && (
          <p className="mt-0.5 text-sm" style={{ color: t.subtext }}>
            {card.jobTitle}
            {card.jobTitle && card.company ? " · " : ""}
            {card.company}
          </p>
        )}
        {card.department && (
          <p className="text-xs" style={{ color: t.subtext }}>
            {card.department}
          </p>
        )}
        {card.tagline && (
          <p className="mt-2 text-sm italic" style={{ color: accent }}>
            “{card.tagline}”
          </p>
        )}
        {card.bio && (
          <p className="mt-2 text-sm" style={{ color: t.subtext }}>
            {card.bio}
          </p>
        )}
      </div>

      {/* Actions */}
      {visibleActions.length > 0 && (
        <div className="mt-5 grid grid-cols-2 gap-2 px-6">
          {visibleActions.map((a) => {
            const isPrimary = a.label === "Save Contact";
            return (
              <a
                key={a.label}
                href={a.href}
                {...(a.download ? { download: true } : {})}
                {...(!a.download && a.href?.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                onClick={() => onTrack?.(a.track)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-semibold transition active:scale-[0.97]"
                style={{
                  background: isPrimary ? t.buttonBg : t.chipBg,
                  color: isPrimary ? t.buttonText : t.text,
                  border: `1px solid ${isPrimary ? t.buttonBorder : t.cardBorder}`,
                  borderRadius: "12px",
                  gridColumn:
                    visibleActions.length % 2 === 1 && isPrimary
                      ? "span 2"
                      : undefined,
                }}
              >
                <a.icon className="h-4 w-4" />
                {a.label}
              </a>
            );
          })}
        </div>
      )}

      {/* Socials */}
      {socials.length > 0 && (
        <div className="mt-5 flex flex-wrap justify-center gap-2 px-6">
          {socials.map((s) => {
            const Icon = SOCIAL_ICONS[s.key];
            return (
              <a
                key={s.key}
                href={ext(s.url)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrack?.("SOCIAL_CLICK", { platform: s.key })}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center transition hover:scale-110"
                style={{
                  background: t.chipBg,
                  color: accent,
                  borderRadius: "10px",
                  border: `1px solid ${t.cardBorder}`,
                }}
              >
                <Icon className="h-5 w-5" />
              </a>
            );
          })}
        </div>
      )}

      {/* About + address */}
      {(card.about || card.address) && (
        <div className="mt-5 space-y-3 px-6">
          {card.about && (
            <div>
              <p
                className="mb-1 text-xs font-semibold uppercase tracking-wide"
                style={{ color: accent }}
              >
                About
              </p>
              <p className="text-sm leading-relaxed" style={{ color: t.subtext }}>
                {card.about}
              </p>
            </div>
          )}
          {card.address && (
            <div
              className="flex items-start gap-2 text-sm"
              style={{ color: t.subtext }}
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: accent }} />
              {card.address}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 pb-5 text-center text-[11px]" style={{ color: t.subtext }}>
        Powered by{" "}
        <span style={{ color: accent }} className="font-semibold">
          Tapcard
        </span>
      </div>
    </div>
  );
}
