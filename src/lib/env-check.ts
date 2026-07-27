// ─────────────────────────────────────────────────────────────────────────────
// Production configuration guard.
//
// Several of this app's variables fail *silently* when unset — the app builds,
// boots, serves traffic, and quietly does the wrong thing:
//
//   • NEXT_PUBLIC_APP_URL unset  → appUrl() falls back to http://localhost:3000,
//     so every share link and QR code points at the visitor's own machine.
//   • GOOGLE_CLIENT_ID/SECRET    → the Google button silently disappears, and
//     the only remaining way in is a one-time email code.
//   • AUTH_SECRET unset          → sessions and mobile tokens can't be signed.
//
// Each of those is worse than a failed deploy, because you find out from a
// customer. This runs at build time (wired into next.config.ts) and turns them
// into a loud, specific build failure instead.
//
// Development is left alone entirely — the localhost fallbacks are what make
// `npm run dev` work with an empty .env.
// ─────────────────────────────────────────────────────────────────────────────

type Problem = { level: "error" | "warn"; message: string };

/** Hosts that are fine locally but are certainly wrong on a public deployment. */
function looksLocal(url: string): boolean {
  return /^https?:\/\/(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(
    url,
  );
}

export function checkProductionEnv(): Problem[] {
  const problems: Problem[] = [];
  const {
    NEXT_PUBLIC_APP_URL,
    AUTH_SECRET,
    DATABASE_URL,
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    EMAIL_SERVER,
  } = process.env;

  if (!AUTH_SECRET) {
    problems.push({
      level: "error",
      message: "AUTH_SECRET is not set. It signs session cookies and mobile bearer tokens.",
    });
  }

  if (!DATABASE_URL) {
    problems.push({ level: "error", message: "DATABASE_URL is not set." });
  }

  if (!NEXT_PUBLIC_APP_URL) {
    problems.push({
      level: "error",
      message:
        "NEXT_PUBLIC_APP_URL is not set, so share links and QR codes would be built " +
        "from the http://localhost:3000 fallback and be dead for everyone who scans them.",
    });
  } else if (looksLocal(NEXT_PUBLIC_APP_URL)) {
    problems.push({
      level: "error",
      message:
        `NEXT_PUBLIC_APP_URL is "${NEXT_PUBLIC_APP_URL}", which is a local/private address. ` +
        "Card links and QR codes are built from it and would be unreachable off your network. " +
        "Set it to the public https:// origin.",
    });
  } else if (!NEXT_PUBLIC_APP_URL.startsWith("https://")) {
    problems.push({
      level: "warn",
      message: `NEXT_PUBLIC_APP_URL is not https (${NEXT_PUBLIC_APP_URL}).`,
    });
  }

  // Both halves or neither — one alone silently disables the Google button,
  // which looks identical to "we never configured it".
  if (Boolean(GOOGLE_CLIENT_ID) !== Boolean(GOOGLE_CLIENT_SECRET)) {
    problems.push({
      level: "error",
      message:
        "Only one of GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET is set. Both are required, " +
        "or the Google sign-in button silently will not render.",
    });
  } else if (!GOOGLE_CLIENT_ID) {
    problems.push({
      level: "warn",
      message:
        "Google sign-in is not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). " +
        "Users will only be able to sign in with a one-time email code.",
    });
  }

  if (!EMAIL_SERVER) {
    problems.push({
      level: "error",
      message:
        "EMAIL_SERVER is not set, so one-time sign-in codes would be printed to the " +
        "server console instead of emailed — nobody could sign in that way.",
    });
  }

  return problems;
}

/**
 * Prints warnings and throws on errors. Called from next.config.ts, so a
 * misconfigured production build fails at deploy time rather than in front of
 * a customer.
 */
export function assertProductionEnv(): void {
  const problems = checkProductionEnv();
  const errors = problems.filter((p) => p.level === "error");
  const warnings = problems.filter((p) => p.level === "warn");

  for (const w of warnings) {
    console.warn(`⚠️  [config] ${w.message}`);
  }

  if (errors.length) {
    throw new Error(
      `\n\n❌ Production build blocked — ${errors.length} configuration problem(s):\n\n` +
        errors.map((e) => `  • ${e.message}`).join("\n\n") +
        `\n\nSet these in your hosting environment (Coolify → the app → Environment Variables).\n` +
        `See .env.example and docs/DEPLOYMENT.md. Note that NEXT_PUBLIC_* values are baked in\n` +
        `at build time, so they must be present for the build, not just at runtime.\n`,
    );
  }
}
