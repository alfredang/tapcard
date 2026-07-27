import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — Tapcard",
  description: "How Tapcard collects, uses, and protects your information.",
};

const UPDATED = "8 July 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Tapcard
        </Link>

        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated {UPDATED}</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-muted-foreground">
          <p>
            Tapcard (&ldquo;Tapcard&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) provides a digital
            business card app and website that let you create, share, and manage smart contact
            cards. This Privacy Policy explains what information we collect, how we use it, and the
            choices you have. By using Tapcard you agree to the practices described here.
          </p>

          <Section title="Information we collect">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground">Account information</span> — your name, email
                address, and a securely hashed password if you choose to set one. You can also
                sign in with Google or a one-time code sent to your email, in which case no
                password is stored.
              </li>
              <li>
                <span className="text-foreground">Card content</span> — the details you add to your
                digital card, such as job title, company, phone, email, website, social links, and
                any photos or logos you upload.
              </li>
              <li>
                <span className="text-foreground">Contacts &amp; leads</span> — details of people you
                save or that are captured when someone shares their information through your card.
              </li>
              <li>
                <span className="text-foreground">Usage &amp; analytics</span> — anonymous events
                such as card views, taps, and leads, used to show you how your cards perform.
              </li>
              <li>
                <span className="text-foreground">Device information</span> — basic technical data
                (such as device type and app version) needed to operate and secure the service.
              </li>
            </ul>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc space-y-1 pl-5">
              <li>To create, sync, and display your digital cards across your devices and the web.</li>
              <li>To let you share your card and to capture leads you choose to collect.</li>
              <li>To provide analytics on how your cards are performing.</li>
              <li>To secure your account, prevent abuse, and provide customer support.</li>
              <li>To improve and develop new features.</li>
            </ul>
          </Section>

          <Section title="How we share information">
            <p>
              We do <span className="text-foreground">not</span> sell your personal information. We
              share information only in these limited cases:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground">When you share your card</span> — a card you
                publish is publicly viewable by anyone you send its link or QR code to.
              </li>
              <li>
                <span className="text-foreground">Service providers</span> — trusted vendors (such as
                hosting and database providers) that process data on our behalf under confidentiality
                obligations.
              </li>
              <li>
                <span className="text-foreground">Legal reasons</span> — when required by law or to
                protect the rights, safety, and security of Tapcard and its users.
              </li>
            </ul>
          </Section>

          <Section title="Data retention &amp; deletion">
            <p>
              We keep your information for as long as your account is active. You can delete your
              account at any time from <span className="text-foreground">Settings &rarr; Delete
              account</span> in the app. Deleting your account removes your cards and analytics and
              anonymizes your account so it can no longer be signed into. Some records may be retained
              in anonymized form where required for legitimate business or legal purposes.
            </p>
          </Section>

          <Section title="Security">
            <p>
              We use industry-standard measures to protect your data, including encrypted transport
              (HTTPS), hashed passwords, short-lived single-use login codes, and access controls.
              No method of transmission or storage is 100% secure, but we work continuously to
              protect your information.
            </p>
          </Section>

          <Section title="Your rights">
            <p>
              Depending on where you live, you may have the right to access, correct, export, or
              delete your personal information. You can manage most of this directly in the app, or
              contact us for help with any request.
            </p>
          </Section>

          <Section title="Children&rsquo;s privacy">
            <p>
              Tapcard is not intended for children under 13 (or the minimum age required in your
              country), and we do not knowingly collect information from them.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the
              &ldquo;Last updated&rdquo; date above and, where appropriate, notify you in the app.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              If you have questions about this Privacy Policy or your data, please reach out through
              our{" "}
              <Link href="/help" className="text-foreground underline underline-offset-4">
                Help &amp; Support
              </Link>{" "}
              page.
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
