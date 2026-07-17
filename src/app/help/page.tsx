import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = {
  title: "Help & Support — Tapcard",
  description: "Guides and answers for using Tapcard digital business cards.",
};

// TODO(Amanda): set this to your real support address.
const SUPPORT_EMAIL = "support@tertiaryinfotech.com";

function Faq({ q, a }: { q: string; a: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="font-semibold text-foreground">{q}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </div>
  );
}

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tapcard
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Help &amp; Support</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Everything you need to get the most out of your Tapcard.
        </p>

        {/* Getting started */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Getting started</h2>
          <ol className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground">
            <li>
              <span className="text-foreground">1. Create your account</span> — sign up with your
              email in the app or on the web. Your cards and contacts sync automatically.
            </li>
            <li>
              <span className="text-foreground">2. Build your card</span> — add your name, role,
              contact details, socials, and a photo. Pick a theme and colour.
            </li>
            <li>
              <span className="text-foreground">3. Share it</span> — send your card with a tap
              (NFC), a QR code, or a link. The other person doesn&rsquo;t need the app.
            </li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            <Faq
              q="How do I share my card?"
              a="Open your card and tap Share. You can show a QR code, send a link, tap phones together with NFC, or save your details straight to someone's contacts."
            />
            <Faq
              q="How do I scan someone else's card?"
              a="Tap Scan on the app's home screen and point your camera at a paper business card or a QR code. Tapcard reads the details so you can save them as a contact."
            />
            <Faq
              q="Does my data sync across devices?"
              a="Yes. When you're signed in, your cards, contacts, and analytics sync to your account and are available on the app and the web."
            />
            <Faq
              q="How do I add a photo or logo?"
              a="In the card editor, open the Media section and choose Take photo or pick from your gallery (on the web, use Upload file). Images are optimised automatically."
            />
            <Faq
              q="How do I delete my account?"
              a={
                <>
                  Go to <span className="text-foreground">Settings &rarr; Delete account</span> in the
                  app. This permanently removes your cards and analytics and anonymizes your account.
                  See our{" "}
                  <Link href="/privacy" className="text-foreground underline underline-offset-4">
                    Privacy Policy
                  </Link>{" "}
                  for details.
                </>
              }
            />
          </div>
        </section>

        {/* Contact */}
        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold">Still need help?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Our team is happy to help with anything not covered here.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background transition hover:opacity-90"
          >
            <Mail className="h-4 w-4" /> Email support
          </a>
        </section>
      </div>
    </main>
  );
}
