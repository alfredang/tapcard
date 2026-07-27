# Production deployment checklist

Everything that has to be true for a deploy to actually work for real users.

The build now refuses to complete if the fatal items are missing — see
`src/lib/env-check.ts`. That converts the silent failures (dead QR codes, a
vanished Google button) into a build error you see at deploy time.

---

## 1. Environment variables (Coolify → the app → Environment Variables)

`.env` is local-only and gitignored. Production reads its own set — nothing
carries over from your machine.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | **yes** | Postgres connection string. |
| `AUTH_SECRET` | **yes** | Signs session cookies *and* mobile bearer tokens. Changing it logs everyone out of both web and app. |
| `NEXT_PUBLIC_APP_URL` | **yes** | `https://tapcard.tertiaryinfotech.com`. See the warning below. |
| `EMAIL_SERVER` | **yes** | SMTP string. Without it, one-time codes print to the server console instead of being emailed — i.e. nobody can sign in that way. |
| `EMAIL_FROM` | recommended | Sender shown on the code email. |
| `GOOGLE_CLIENT_ID` | for Google sign-in | Both halves or neither. |
| `GOOGLE_CLIENT_SECRET` | for Google sign-in | |
| `GOOGLE_MOBILE_CLIENT_IDS` | for native apps | Comma-separated. `/api/mobile/oauth/google` returns 501 until set. |
| `MOBILE_API_KEY` | optional | Gates the legacy iOS onboard / delete-account paths. |
| `CLAUDE_CODE_OAUTH_TOKEN` | for AI features | Bio generation, lead scoring. |

> **`NEXT_PUBLIC_*` is baked in at build time, not read at runtime.**
> Changing `NEXT_PUBLIC_APP_URL` in Coolify has no effect until you **rebuild**.
> Restarting the container is not enough. Every share link and QR code is
> generated from this value by `appUrl()`, so if it's wrong, cards that are
> already printed and in people's wallets point somewhere dead.

## 2. Google sign-in

1. **Redirect URI registered.** In the `Tapcard` Google Cloud project → Google
   Auth Platform → Clients → `tapcard-sociallogin`, confirm:
   ```
   https://tapcard.tertiaryinfotech.com/api/auth/callback/google
   ```
2. **Publish the consent screen.** Audience → *Publishing status* → **Publish app**.
   While it's in *Testing*, only manually-listed test users can sign in (100 max);
   everyone else is blocked. Basic sign-in scopes (`openid`, `email`, `profile`)
   are non-sensitive, so publishing is instant with no Google review.
3. Confirm the consent screen reads **"Sign in to Tapcard"**.

> If you later enable the Google Calendar integration (`googleCalRefresh` in the
> schema), Calendar is a *sensitive* scope and does require Google verification,
> which takes weeks. It also means refresh tokens expire after 7 days while the
> app is unpublished.

## 3. Database

```bash
npx prisma migrate deploy
```

Run against the production database on any deploy that changes `schema.prisma`.
Use `migrate deploy`, never `migrate dev`, in production.

## 4. Post-deploy smoke test

- [ ] `/login` shows **both** the email field and the Google button.
- [ ] Sign in with a one-time code — the email actually arrives (not just the console).
- [ ] Sign in with Google — lands on `/dashboard`.
- [ ] Both routes reach the **same** account for the same address (they link by verified email).
- [ ] Open a published card and **scan its QR with a phone on mobile data, not Wi-Fi.**
      This is the check that catches a wrong `NEXT_PUBLIC_APP_URL`; on your own
      network a LAN address resolves and looks fine.
- [ ] `/api/mobile/otp/request` responds — the app's sign-in path.

## 5. Mobile

Deploying the current server **breaks existing app builds**: `/api/mobile/login`
and `/api/mobile/register` are gone (passwordless now), so any installed version
still calling them gets a 404. Time an app release alongside the deploy, or
expect support tickets from users on the old build.

---

## Local production builds

The config guard runs on `npm run build`. If you want to check compilation
locally while `.env` still points at a LAN IP for phone testing:

```bash
SKIP_ENV_CHECK=1 npm run build
```

Never set `SKIP_ENV_CHECK` in the real deployment environment — it exists purely
so a local build doesn't nag about local settings.
