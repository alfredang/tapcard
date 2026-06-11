# Tapcard — Digital Business Cards + CRM

A modern, mobile-first **digital business card platform with an integrated CRM** —
a production-ready alternative to Blinq / CLDY. Create a professional card in under
two minutes, share it via QR / link / WhatsApp, capture leads, and manage the whole
relationship in a built-in CRM.

> Built with Next.js 16, TypeScript, Tailwind v4, Prisma + PostgreSQL, Auth.js v5,
> Framer Motion, and the **Claude Agent SDK** (subscription-based, no API key) for AI.

---

## ✨ What's included

**Fully built**
- **Landing page** — hero, features, how-it-works, 6-theme template showcase, testimonials, 4-tier pricing, working contact form.
- **Auth** — email + password, **email OTP** (no external secrets needed), and Google / Microsoft / LinkedIn OAuth that auto-enable when credentials are present.
- **Card Builder** — Canva-style 3-panel editor (content · live preview · design) with **instant preview**, autosave, 6 themes, accent color, AI bio/about generation, publish toggle, QR + share panel.
- **Public card** (`/c/<slug>`) — themed, mobile-first, with Save-Contact (VCF), Call, WhatsApp, Email, Website, social links, share, and a lead-capture form.
- **QR codes** — open card / save contact / WhatsApp / email / website, with color customization and **PNG / SVG** download.
- **VCF export** — vCard 3.0, compatible with iPhone, Android, Google and Outlook.
- **CRM** — contacts (add / edit / delete / search / **CSV export**), a **leads inbox** with one-click convert + **AI lead scoring**, and a **drag-and-drop Kanban pipeline** (7 stages).
- **Dashboard & Analytics** — overview KPIs, recent leads, engagement breakdown, per-card performance. Events (views, scans, downloads, clicks) are captured automatically.

**Scaffolded** (navigable placeholders, data model already in place): tasks, appointment booking + calendar sync, team management / company directory / bulk creation, white-label custom domains, full time-series analytics, admin dashboard.

---

## 🚀 Quick start

### Prerequisites
- Node.js 22+
- Docker (for the local Postgres) — or your own `DATABASE_URL`

### 1. Install
```bash
npm install
cp .env.example .env        # then set AUTH_SECRET (openssl rand -base64 32)
```

### 2. Start the database
```bash
docker compose up -d db     # Postgres on host port 5434
```

### 3. Migrate + seed
```bash
npm run setup               # prisma migrate dev + seed demo data
```

### 4. Run
```bash
npm run dev
```
Open http://localhost:3000

**Demo login:** `demo@tapcard.app` / `password123`
**Demo public card:** http://localhost:3000/c/jordan-avery

> Email OTP codes are printed to the **server console** in dev (no email server required).

---

## 🤖 AI features (Claude Agent SDK — subscription, not an API key)

AI (bio/about generation, lead scoring & summaries) runs through
`@anthropic-ai/claude-agent-sdk`, which uses your **Claude subscription** via the
logged-in Claude credentials — **never an `ANTHROPIC_API_KEY`**.

- **Local dev:** if you're logged into Claude Code, it just works.
- **Headless / production:** generate a token with `claude setup-token` and set
  `CLAUDE_CODE_OAUTH_TOKEN` in `.env`. The `claude` CLI must be present in the
  runtime (see the commented line in the `Dockerfile`).
- **No credential?** Every AI feature **degrades gracefully** to a sensible
  templated result — nothing breaks.

---

## 🗄️ Environment variables

See [`.env.example`](./.env.example). Key ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` | Auth.js secret (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_APP_URL` | Public base URL (QR/share links, OAuth callbacks) |
| `GOOGLE_/MICROSOFT_/LINKEDIN_CLIENT_ID/SECRET` | OAuth (optional; auto-enables) |
| `EMAIL_SERVER`, `EMAIL_FROM` | OTP email delivery (dev logs to console) |
| `CLAUDE_CODE_OAUTH_TOKEN`, `CLAUDE_MODEL` | AI via Claude subscription |

---

## 🐳 Deployment

### Docker (full stack)
```bash
AUTH_SECRET=$(openssl rand -base64 32) docker compose --profile full up --build
```
This runs Postgres + the app (Next.js standalone output) together.

### Coolify / Vercel
- **Coolify:** point it at this repo; it builds the `Dockerfile`. Provision a
  PostgreSQL resource and set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`.
  Run `npx prisma migrate deploy` as a post-deploy/release command.
- **Vercel:** compatible (standalone build). Add a hosted Postgres (Neon/Supabase),
  set the env vars, and add `prisma migrate deploy` to the build.

---

## 📜 Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | `prisma generate` + production build |
| `npm run setup` | Migrate + seed |
| `npm run db:migrate` | Create/apply a migration |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run format` | Prettier |

---

## 🧱 Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Prisma 6 ·
PostgreSQL · Auth.js v5 · Framer Motion · React Hook Form + Zod · dnd-kit ·
qrcode · Claude Agent SDK.

## 📂 Structure

```
prisma/            schema + seed
src/
  app/
    (marketing)/   landing
    (auth)/        login / register
    (app)/         dashboard, cards, crm, analytics, settings, scaffolds
    c/[slug]/      public card
    api/           route handlers
  components/      ui, card, builder, crm, marketing, app
  lib/             db, ai, vcf, qr, whatsapp, themes, validators, session
```

---

Built as a modern alternative to Blinq and CLDY — focused on simplicity, speed,
mobile usability, lead generation, and CRM.
