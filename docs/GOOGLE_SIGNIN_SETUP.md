# Google sign-in — website setup

How to get the "Continue with Google" button live on `/login` and `/register`.

Tapcard is passwordless: Google SSO and one-time email codes are the only two ways in.
The Google button is **hidden until credentials exist** — `src/auth.ts` only registers the
provider when `GOOGLE_CLIENT_ID` *and* `GOOGLE_CLIENT_SECRET` are both set. That's
deliberate: a button with no credentials behind it renders fine and then errors on click.

Covers the website only. Android and iOS need their own OAuth clients — see the note at the end.

---

## 1. Create the OAuth client

[Google Cloud Console → Google Auth Platform → Clients](https://console.cloud.google.com/auth/clients)
→ **Create client**.

| Field | Value |
| --- | --- |
| Application type | **Web application** |
| Name | `tapcard-sociallogin` (internal label only — users never see it) |
| Authorized JavaScript origins | *leave empty* |
| Authorized redirect URIs | the two below |

```
https://tapcard.tertiaryinfotech.com/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

- Copy them exactly — no trailing slash. Google matches the full string (scheme, host,
  port, path); there are no wildcards.
- `/api/auth/callback/google` is Auth.js's route, not the site root.
- **JavaScript origins stays empty.** Auth.js uses the server-side authorization code
  flow, so that field is only for browser-side JS clients.
- Private IPs (`192.168.x.x`) are rejected by Google — non-loopback URIs must be HTTPS on
  a public domain. Test Google sign-in at `localhost:3000`, not a LAN IP.

Click **Create**. Google shows the **Client ID** and **Client secret** — keep the tab open,
or find them later under Clients → click the client name.

## 2. Configure the Audience (do this before testing)

**Google Auth Platform → Audience.** This is the most common reason a correctly-configured
client still fails.

- **Internal** — only accounts in your Google Workspace org can sign in. Best while you're
  building, if everyone testing has a `@tertiaryinfotech.com` account.
- **External + Testing** — only accounts on the **Test users** list can sign in. Everyone
  else gets *"Access blocked: Tapcard has not completed the Google verification process."*
  Add each tester's Gmail address here.
- **External + In production** — anyone with a Google account. Required for real users.
  Basic sign-in scopes (`openid`, `email`, `profile`) are non-sensitive, so publishing
  does **not** require Google's app review.

## 3. Add the credentials locally

In `.env` (see `.env.example` for the full list):

```bash
GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxx"
```

`.env` is gitignored — never commit real credentials.

## 4. Restart the dev server

```bash
npm run dev
```

A full restart, not a hot reload — `enabledOAuth` in `src/auth.ts` is evaluated once at
module load, so a running server won't pick up new env vars.

## 5. Test locally

1. Open <http://localhost:3000/login> (**not** the LAN IP — Google will refuse it).
2. "Continue with Google" now appears above the email field, with an *"or use your email"*
   divider between them.
3. Sign in. You should land on `/dashboard`.
4. Check it created the account: the user row is upserted by
   `src/app/api/mobile/oauth/google/route.ts` on mobile and by the Prisma adapter on web.

Email OTP should still work alongside it — in dev with no `EMAIL_SERVER`, the code is
printed to the **server console** rather than emailed.

## 6. Deploy

Set the same two variables in your hosting environment (Coolify → the app → Environment
Variables), then redeploy.

While you're there, confirm `NEXT_PUBLIC_APP_URL` is `https://tapcard.tertiaryinfotech.com`.
Every public card link and QR code is built from it by `appUrl()` — if production inherited
a local value, live cards point somewhere unreachable.

`AUTH_SECRET` must also be set in production. Changing it invalidates every existing
session and mobile bearer token.

No `AUTH_URL` is needed: `src/auth.ts` sets `trustHost: true`, so Auth.js derives the
callback URL from the request.

## 7. Verify in production

Open <https://tapcard.tertiaryinfotech.com/login>, sign in with Google, confirm you reach
the dashboard.

---

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| No Google button on `/login` | Env vars missing, or the server wasn't fully restarted. Both `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` must be set — one alone does nothing. |
| `Error 400: redirect_uri_mismatch` | The URI in the Console doesn't match byte-for-byte. Check scheme (`http` vs `https`), port, and trailing slash. The error page shows the exact URI that was sent — copy it into the Console. |
| `Access blocked: … has not completed the Google verification process` | Audience is *External + Testing* and the account isn't a listed test user. See step 2. |
| Works on localhost, fails in production | Env vars not set in Coolify, or the production redirect URI was never added. |
| Sign-in succeeds but lands back on `/login` | Usually `AUTH_SECRET` missing or differing between instances, so the session cookie can't be verified. |

---

## Mobile

Native apps need their **own** OAuth clients — Android (package name + SHA-1) and iOS
(bundle ID). They don't use redirect URIs at all: the native SDK handles sign-in on-device
and posts the resulting ID token to `POST /api/mobile/oauth/google`.

Note that on Android the ID token's `aud` is the **Web** client ID from step 1, not the
Android one, because Credential Manager takes the web client ID as its `serverClientId`.
The server checks `aud` against `GOOGLE_MOBILE_CLIENT_IDS` (comma-separated) and returns
`501` while that variable is unset — without an audience to check, a token minted for any
other Google app would be accepted.
