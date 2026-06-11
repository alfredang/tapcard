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
import { THEME_LIST } from "@/lib/themes";
import type { CardData } from "@/lib/card";

export const metadata = {
  title: "Tapcard — Replace Paper Business Cards with Smart Digital Cards",
};

const demoCard: CardData = {
  fullName: "Jordan Avery",
  jobTitle: "Founder & Principal",
  company: "Avery Growth",
  tagline: "Turning ambitious goals into results.",
  bio: "I help founders scale revenue with sharp positioning.",
  mobile: "+14155550142",
  whatsapp: "+14155550142",
  email: "jordan@averygrowth.com",
  website: "https://averygrowth.com",
  linkedin: "https://linkedin.com/in/jordanavery",
  instagram: "https://instagram.com/jordan.avery",
  twitter: "https://x.com/jordanavery",
  theme: "MODERN",
  accentColor: "#7c5cff",
};

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
    desc: "Message, request a quote, or get support — all from a single tap on your card.",
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
  { n: "2", title: "Share via QR code", desc: "Tap, scan or send a link — anywhere." },
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
    name: "Daniela M.",
    role: "VP Sales, Helix",
  },
  {
    quote:
      "Setup took two minutes. The CRM means I never lose a lead from an event again.",
    name: "Marcus L.",
    role: "Realtor",
  },
  {
    quote:
      "The QR + WhatsApp combo is a conversation starter at every meeting. Clients love it.",
    name: "Priya N.",
    role: "Consultant",
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
      {/* Hero */}
      <section className="grid-bg relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge tone="primary" className="mb-5">
              <Zap className="h-3 w-3" /> Digital Business Cards + CRM
            </Badge>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Replace paper cards with{" "}
              <span className="gradient-text">smart digital cards</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Create, share, capture leads, and manage customer relationships
              from a single platform — and publish a professional card in under
              two minutes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create free card <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#contact">Book a demo</a>
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> No app required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-4 w-4 text-success" /> Free forever plan
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="animate-float">
              <CardView card={demoCard} />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Everything you need"
          title="One platform, end to end"
          subtitle="From the first tap to a closed deal — Tapcard handles sharing, capture and CRM."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading
            eyebrow="How it works"
            title="Live in four simple steps"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
      <section id="templates" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Templates"
          title="Six themes. Endless brands."
          subtitle="Corporate, Modern, Minimalist, Dark, Creative and Luxury — built for every profession."
        />
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {TEMPLATE_CATEGORIES.map((c) => (
            <Badge key={c}>{c}</Badge>
          ))}
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_LIST.map((theme) => (
            <div key={theme.key} className="flex flex-col items-center gap-3">
              <CardView
                card={{ ...demoCard, theme: theme.key, accentColor: theme.accent }}
              />
              <span className="text-sm font-medium text-muted-foreground">
                {theme.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-y border-border/60 bg-surface/30">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <SectionHeading eyebrow="Loved by teams" title="Results, not just cards" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <Surface key={t.name} className="p-6">
                <div className="mb-3 flex gap-0.5 text-warning">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed">“{t.quote}”</p>
                <div className="mt-4 text-sm">
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-muted-foreground">{t.role}</p>
                </div>
              </Surface>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-4 py-20">
        <SectionHeading
          eyebrow="Pricing"
          title="Start free, scale when ready"
        />
        <div className="mt-12 grid gap-5 lg:grid-cols-4">
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
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-4 py-20 lg:grid-cols-2">
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
