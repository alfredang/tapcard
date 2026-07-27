import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import LinkedIn from "next-auth/providers/linkedin";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

// ─────────────────────────────────────────────────────────────────────────────
// Tapcard has exactly two ways in: social sign-on and a one-time email code.
// There is no password anywhere in the system — `User.password` is retained in
// the schema only so existing rows aren't destroyed, and nothing reads it.
// ─────────────────────────────────────────────────────────────────────────────

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
      id: "otp",
      name: "Email OTP",
      credentials: { email: {}, code: {} },
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase();
        const code = String(creds?.code || "");
        if (!email || !code) return null;
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
