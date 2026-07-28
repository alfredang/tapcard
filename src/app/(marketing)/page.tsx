import Link from "next/link";
import {
  QrCode,
  Contact,
  MessageCircle,
  LayoutGrid,
  Users,
  BarChart3,
  Sparkles,
  Check,
  ArrowRight,
  Zap,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface, Badge } from "@/components/ui/card";
import { CardView } from "@/components/card/card-view";
import { ContactForm } from "@/components/marketing/contact-form";
import { HeroCardShowcase } from "@/components/marketing/hero-card-showcase";
import { LeadMagnet } from "@/components/marketing/lead-magnet";
import { avatarUrl } from "@/lib/avatar";
import { THEME_LIST } from "@/lib/themes";
import { demoCard, demoPersonas } from "@/lib/demo-card";

export const metadata = {
  title: "Digital Business Cards with a Built-in CRM",
  description:
    "Replace paper business cards with smart digital cards. Share by QR code, save to contacts, capture leads and manage your pipeline. Free plan, no app required.",
  alternates: { canonical: "/" },
};

// Structured data helps Google render rich results for the product and the FAQ.
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      name: "Tapcard",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web, iOS",
      url: "https://tapcard.tertiaryinfotech.com",
      description:
        "Smart digital business cards with a built-in CRM. Share by QR code, capture leads and manage your sales pipeline.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan with one digital card, QR code and lead capture.",
      },
      publisher: {
        "@type": "Organization",
        name: "Tertiary Infotech Academy Pte Ltd",
        url: "https://www.tertiaryinfotech.com/",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is a digital business card?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A digital business card is a shareable web profile holding your contact details, links and branding. You share it by QR code or link, and the recipient saves you to their contacts without needing an app.",
          },
        },
        {
          "@type": "Question",
          name: "Does the person receiving my card need an app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Your card opens in any browser and saves to iPhone, Android, Google and Outlook contacts as a standard VCF file.",
          },
        },
        {
          "@type": "Question",
          name: "Is Tapcard free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The free plan includes one digital card, QR code sharing, a lead capture form and basic analytics, with no card required.",
          },
        },
      ],
    },
  ],
};

const FEATURED_THEMES = ["MODERN", "OCEAN", "LUXURY"];

const FEATURES = [
  {
    icon: QrCode,
    title: "QR Code Sharing",
    desc: "Generate branded QR codes that open your card, save your contact, or start a WhatsApp chat.",
  },
  {
    icon: Contact,
    title: "Save to Contacts",
    desc: "One tap exports a VCF that works flawlessly on iPhone, Android, Google and Outlook.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Integration",
    desc: "Message, request a quote, or get support, all from a single tap on your card.",
  },
  {
    icon: LayoutGrid,
    title: "Built-in CRM",
    desc: "Every lead lands in a pipeline. Manage contacts, deals and follow-ups in one place.",
  },
  {
    icon: Users,
    title: "Team Management",
    desc: "Roll out branded cards across your whole company and keep everyone on-message.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    desc: "Track views, scans, downloads and clicks so you know what's working.",
  },
];

const STEPS = [
  { n: "1", title: "Create your card", desc: "Add your details with our 2-minute wizard." },
  { n: "2", title: "Share via QR code", desc: "Tap, scan or send a link, anywhere." },
  { n: "3", title: "Capture leads", desc: "Visitors save your contact and submit their info." },
  { n: "4", title: "Manage customers", desc: "Nurture every lead in the built-in CRM." },
];

const TEMPLATE_CATEGORIES = [
  "Corporate",
  "Consultant",
  "Insurance",
  "Real Estate",
  "Trainer",
  "Healthcare",
  "Startup Founder",
];

const TESTIMONIALS = [
  {
    quote:
      "We replaced 2,000 paper cards across our sales team. Lead capture tripled in a quarter.",
    name: "Wei Ling Tan",
    role: "VP Sales, Marina Capital",
  },
  {
    quote:
      "Setup took two minutes. The CRM means I never lose a lead from an event again.",
    name: "Marcus Lee",
    role: "Realtor, Brightline",
  },
  {
    quote:
      "The QR and WhatsApp combo starts a conversation at every meeting. Clients love it.",
    name: "Priya Nair",
    role: "Consultant, Nimbus",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 digital card", "QR code & VCF", "Lead capture form", "Basic analytics"],
    cta: "Start free",
  },
  {
    name: "Professional",
    price: "$9",
    period: "/mo",
    features: ["Unlimited cards", "Custom themes & QR", "Full CRM pipeline", "AI bio & lead scoring"],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Business",
    price: "$29",
    period: "/mo",
    features: ["Everything in Pro", "Team management", "Company directory", "Team analytics"],
    cta: "Start trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: ["White-label & domains", "SSO & admin controls", "API access", "Priority support"],
    cta: "Contact sales",
  },
];

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
      />

      {/* Hero */}
      <section className="grid-bg relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:py-14">
          <div>
            <Badge tone="primary" className="mb-4">
              <Zap className="h-3 w-3" /> Digital Business Cards + CRM
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Replace paper cards with{" "}
              <span className="gradient-text">smart digital cards</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg text-muted-foreground">
              Create, share, capture leads, and manage customer relationships
              from a single platform, and publish a professional card in under
              two minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create free card <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">Book a demo</a>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> No app required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> Free forever plan
              </span>
            </div>
          </div>

          <HeroCardShowcase />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          eyebrow="Everything you need"
          title="One platform, end to end"
          subtitle="From the first tap to a closed deal. Tapcard handles sharing, capture and CRM."
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Surface key={f.title} className="p-6 transition hover:border-primary/40">
              <div className="gradient-primary mb-4 flex h-11 w-11 items-center justify-center rounded-lg">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </Surface>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading
            eyebrow="How it works"
            title="Live in four simple steps"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="gradient-text text-5xl font-extrabold">{s.n}</div>
                <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          eyebrow="Templates"
          title="20 themes. Endless brands."
          subtitle="From boardroom Corporate to vivid Sunset - a look for every profession. Here are three favourites."
        />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEMPLATE_CATEGORIES.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_THEMES.map((key, i) => {
            const theme = THEME_LIST.find((t) => t.key === key)!;
            const person = demoPersonas[i % demoPersonas.length];
            return (
              <div key={theme.key} className="flex flex-col items-center gap-3">
                <CardView
                  card={{ ...person, theme: theme.key, accentColor: theme.accent }}
                />
                <span className="text-sm font-medium text-muted-foreground">
                  {theme.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/themes">
              See all {THEME_LIST.length} themes <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <SectionHeading eyebrow="Loved by teams" title="Results, not just cards" />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Surface key={t.name} className="p-6">
                <div className="mb-3 flex gap-0.5 text-warning">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed">“{t.quote}”</p>
                <div className="mt-4 flex items-center gap-3 text-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={avatarUrl(t.name)}
                    alt=""
                    loading="lazy"
                    width={40}
                    height={40}
                    className="border-border h-10 w-10 shrink-0 rounded-full border"
                  />
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      {/* Lead magnet */}
      <LeadMagnet />

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-12">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free, scale when ready"
        />
        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {PRICING.map((p) => (
            <Surface
              key={p.name}
              className={`relative flex flex-col p-6 ${
                p.featured ? "border-primary glow" : ""
              }`}
            >
              {p.featured && (
                <Badge tone="primary" className="absolute -top-2.5 left-6">
                  Most popular
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span className="mb-1 text-sm text-muted-foreground">{p.period}</span>
              </div>
              <ul className="mt-5 flex-1 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-6 w-full"
                variant={p.featured ? "primary" : "outline"}
                asChild
              >
                <Link href={p.name === "Enterprise" ? "#contact" : "/register"}>
                  {p.cta}
                </Link>
              </Button>
            </Surface>
          ))}
        </div>
      </section>

      {/* Contact / CTA */}
      <section id="contact" className="border-t border-border/60 bg-surface/30">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-12 lg:grid-cols-2">
          <div>
            <Badge tone="primary" className="mb-4">
              <Share2 className="h-3 w-3" /> Talk to us
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to ditch paper for good?
            </h2>
            <p className="mt-4 max-w-md text-muted-foreground">
              Book a demo and we&apos;ll show you how Tapcard turns every
              introduction into a tracked, nurtured relationship.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              AI-assisted bios, lead scoring and follow-up suggestions included.
            </div>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
