import NextAuth, { type NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import LinkedIn from "next-auth/providers/linkedin";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { verifyOtp } from "@/lib/otp";

// OAuth providers are added only when their credentials exist in env, so the
// app builds and runs with zero external secrets. Add IDs/secrets to .env to
// light them up.
const oauthProviders = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  oauthProviders.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  oauthProviders.push(
    MicrosoftEntraID({
      clientId: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    }),
  );
}
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  oauthProviders.push(
    LinkedIn({
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
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
      async authorize(creds) {
        const email = String(creds?.email || "").toLowerCase();
        const password = String(creds?.password || "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
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
