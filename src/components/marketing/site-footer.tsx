import Link from "next/link";
import { Apple, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/tertiary-tapcard/id6780261599";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#how", label: "How It Works" },
  { href: "/#templates", label: "Templates" },
  { href: "/#pricing", label: "Pricing" },
];

const RESOURCE_LINKS = [
  { href: "/#contact", label: "Book a Demo" },
  { href: "/help", label: "Help Centre" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/login", label: "Sign In" },
];

export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background/80 mt-24">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {/* Brand */}
        <div className="lg:pr-6">
          <span className="text-background text-lg font-bold tracking-tight">
            Tapcard
          </span>
          <p className="mt-3 text-sm leading-relaxed">
            Smart digital business cards with a built-in CRM. Share by QR code,
            capture every lead, and manage your pipeline in one place.
          </p>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Tertiary Tapcard on the App Store"
            className="focus-visible:outline-background mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-black px-3.5 text-left text-white ring-1 ring-white/20 transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Apple className="h-6 w-6 shrink-0" aria-hidden="true" />
            <span className="leading-none">
              <span className="block text-[9px] font-medium tracking-[0.08em] uppercase">
                Download on the
              </span>
              <span className="mt-0.5 block text-lg font-semibold">
                App Store
              </span>
            </span>
          </a>
        </div>

        {/* Product */}
        <div>
          <h2 className="text-background text-sm font-semibold">Product</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {PRODUCT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-background transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-background text-sm font-semibold">Resources</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {RESOURCE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-background transition">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-background text-sm font-semibold">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                12 Woodlands Square #07-85 Woods Square Tower 1, Singapore
                737715
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a href="tel:+6561000613" className="hover:text-background transition">
                +65 6100 0613
              </a>
            </li>
            <li className="flex gap-2.5">
              <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href="https://wa.me/6588666375"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-background transition"
              >
                WhatsApp +65 8866 6375
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
              <a
                href="mailto:enquiry@tertiaryinfotech.com"
                className="hover:text-background transition"
              >
                enquiry@tertiaryinfotech.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-background/15 border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Tapcard. All rights reserved.</p>
          <p>
            Powered by{" "}
            <a
              href="https://www.tertiaryinfotech.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-background font-medium hover:underline"
            >
              Tertiary Infotech Academy Pte Ltd
            </a>{" "}
            · UEN 201200696W
          </p>
        </div>
      </div>
    </footer>
  );
}
