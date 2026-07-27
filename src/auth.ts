import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import LinkedIn from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// ─────────────────────────────────────────────────────────────────────────────
// Three ways in, all landing on the same account for a given email address:
// a password, a one-time emailed code, or social sign-on.
//
// Accounts created by OTP or OAuth have `User.password` null and simply can't
// use the password tab until they set one; that's why the password provider
// bails on `!user.password` rather than treating it as a mismatch.
// ─────────────────────────────────────────────────────────────────────────────

// Both credential providers below verify with bcrypt, which costs ~100ms of CPU
// by design. Auth.js owns /api/auth/* so there's no route handler to throttle,
// and unthrottled that is two problems at once: unlimited password guesses
// against an address printed on a business card, and a cheap way to saturate a
// single-threaded Node process. The equivalent mobile routes cap attempts, so
// these do too. Checked BEFORE any hashing, or the limiter would burn the CPU
// it exists to protect.
//
// Per-email catches someone grinding one account; per-IP catches someone
// spraying many. Note the limiter is in-memory (see lib/rate-limit.ts): counters
// reset on redeploy and are per-instance, so this is abuse dampening, not a hard
// guarantee.
function attemptAllowed(kind: string, request: unknown, email: string): boolean {
  const byEmail = rateLimit(`web:${kind}:email:${email}`, 10, 10 * 60_000);
  if (!byEmail.ok) return false;

  const ip = request instanceof Request ? clientIp(request) : "unknown";
  return rateLimit(`web:${kind}:ip:${ip}`, 30, 10 * 60_000).ok;
}

// OAuth providers are added only when their credentials exist in env, so the
// app builds and runs with zero external secrets. Google is the provider we
// ship; Microsoft and LinkedIn stay wired up and light up the moment their
// IDs/secrets are added to .env.
//
// `allowDangerousEmailAccountLinking` attaches the provider to an existing user
// when the email matches, instead of failing with OAuthAccountNotLinked. Its
// scary name is about providers that hand over emails they never verified — a
// sign-in there could hijack someone else's account. All three providers below
// do verify ownership, and it's the same proof our one-time email codes rely
// on, so someone who signed in with a code yesterday and Google today has to
// land on one account, not two.
const oauthProviders = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  oauthProviders.push(
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  oauthProviders.push(
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const enabledOAuth = {
  google: oauthProviders.some((p) => p.id === "google"),
  microsoft: oauthProviders.some((p) => p.id === "microsoft-entra-id"),
  linkedin: oauthProviders.some((p) => p.id === "linkedin"),
};

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  // Credentials/OTP require JWT sessions; the adapter still handles OAuth
  // account linking and user records.
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    ...oauthProviders,
    Credentials({
      id: "password",
      name: "Email & Password",
      credentials: { email: {}, password: {} },
      async authorize(creds, request) {
        const email = String(creds?.email || "").toLowerCase();
        const password = String(creds?.password || "");
        if (!email || !password) return null;
        if (!attemptAllowed("password", request, email)) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        // No password set = an OTP/OAuth-only account, not a wrong password.
        if (!user?.password) return null;
        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
    Credentials({
      id: "otp",
      name: "Email OTP",
      credentials: { email: {}, code: {} },
      async authorize(creds, request) {
        const email = String(creds?.email || "").toLowerCase();
        const code = String(creds?.code || "");
        if (!email || !code) return null;
        // Caps guesses at a 6-digit code, matching /api/mobile/otp/verify.
        if (!attemptAllowed("otp", request, email)) return null;
        const valid = await verifyOtp(email, code);
        if (!valid) return null;
        // Upsert a user so first-time OTP logins create an account.
        const user = await prisma.user.upsert({
          where: { email },
          update: { emailVerified: new Date() },
          create: { email, emailVerified: new Date(), name: email.split("@")[0] },
        });
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
