import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "How Tapcard collects, uses, and protects your information.",
};

const UPDATED = "21 October 2026";
const SUPPORT_EMAIL = "support@tertiaryinfotech.com";

/** Mirrors the App Store "App Privacy" label — keep the two in step. */
const APP_DATA: [string, string, string][] = [
  [
    "Contact info",
    "Your name, email, phone numbers and address, for your account and card",
    "App functionality",
  ],
  [
    "Contacts",
    "People you save, including business cards you scan",
    "App functionality",
  ],
  [
    "Photos",
    "The profile photo, banner and logo you add to your card",
    "App functionality",
  ],
  [
    "Other user content",
    "Your bio, notes, tasks and appointments",
    "App functionality",
  ],
  ["Identifiers", "Your Tapcard account ID", "App functionality"],
];

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
            choices you have. It covers the Tapcard website (tapcard.tertiaryinfotech.com) and the
            Tapcard apps for iPhone and Android. By using Tapcard you agree to the practices
            described here.
          </p>

          <Section title="Who we are">
            <p>
              Tapcard is operated by{" "}
              <span className="text-foreground">Tertiary Infotech Academy Pte Ltd</span> (UEN
              201200696W), Singapore. We handle personal data in line with Singapore&rsquo;s
              Personal Data Protection Act (PDPA). You can reach us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-foreground underline underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section title="Information we collect">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground">Account information</span> — your name, email
                address, and a securely hashed password if you choose to set one. You can also
                sign in with Apple, Google or a one-time code sent to your email, in which case no
                password is stored.
              </li>
              <li>
                <span className="text-foreground">Card content</span> — the details you add to your
                digital card, such as job title, company, phone, email, website, social links, and
                any photos or logos you upload.
              </li>
              <li>
                <span className="text-foreground">Contacts &amp; leads</span> — details of other
                people that you save: business cards you scan, QR codes you scan, contacts you type
                in, and leads captured when someone shares their information through your card.
                These can include a name, job title, company, email, phone and WhatsApp numbers,
                address, website and your own notes.
              </li>
              <li>
                <span className="text-foreground">Planner</span> — tasks, reminders and
                appointments you create.
              </li>
              <li>
                <span className="text-foreground">Preferences</span> — settings such as your
                default dialling code, what your QR code opens, and your WhatsApp contact link.
              </li>
              <li>
                <span className="text-foreground">Usage &amp; analytics</span> — events such as card
                views, QR scans, taps and contact downloads, with the visitor&rsquo;s browser type and
                referring page, used to show you how your cards perform. We do not record
                visitors&rsquo; IP addresses with these events.
              </li>
              <li>
                <span className="text-foreground">Device information</span> — basic technical data
                (such as device type and app version) needed to operate and secure the service.
              </li>
            </ul>
          </Section>

          <Section title="Data the apps collect, at a glance">
            <p>
              This is the same summary as the App Privacy section of our App Store listing. All of
              it is linked to your account, used only to run Tapcard for you, and never used to
              track you.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border text-foreground">
                    <th className="py-2 pr-4 font-semibold">Data</th>
                    <th className="py-2 pr-4 font-semibold">What it is</th>
                    <th className="py-2 font-semibold">Used for</th>
                  </tr>
                </thead>
                <tbody>
                  {APP_DATA.map(([data, what, use]) => (
                    <tr key={data} className="border-b border-border/60 align-top">
                      <td className="py-2 pr-4 text-foreground">{data}</td>
                      <td className="py-2 pr-4">{what}</td>
                      <td className="py-2">{use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              We do not track you across other companies&rsquo; apps or websites, we show no ads,
              and we do not sell or share your data with data brokers.
            </p>
          </Section>

          <Section title="What stays on your device">
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground">Card scanning</span> — when you scan a paper
                business card, the camera image is read on your phone (text recognition and, where
                available, Apple Intelligence). The photo itself is not uploaded; only the details
                you review and save are sent to your account.
              </li>
              <li>
                <span className="text-foreground">Apple Intelligence images</span> — banners and
                profile photos created with Image Playground are generated on your iPhone. A
                picture you choose to use is stored with your card like any photo you upload.
              </li>
              <li>
                <span className="text-foreground">Face ID</span> — the optional Face ID lock is
                handled by iOS. We never receive your face data.
              </li>
              <li>
                <span className="text-foreground">Camera &amp; photos</span> — the apps ask for
                camera or photo access only to scan cards and QR codes or to pick a photo for your
                card, and use it only when you do so.
              </li>
            </ul>
          </Section>

          <Section title="Other people&rsquo;s details">
            <p>
              When you save someone&rsquo;s business card or details to Contacts, you are
              responsible for having a reason to keep them, such as a business introduction. We
              store those contacts only for you, use them only to provide the service to you, and
              never sell them or use them to contact the people concerned. If your details were
              saved by a Tapcard user and you want them removed, email us and we will help.
            </p>
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
                hosting, database and email-delivery providers) that process data on our behalf under
                confidentiality obligations.
              </li>
              <li>
                <span className="text-foreground">AI features</span> — when you use an AI feature on
                the website or in the apps, such as writing your bio or summarising a lead, the text
                it needs is sent to our AI provider, Anthropic, to produce the result. Card scanning
                and Apple Intelligence features run on your device and are not sent.
              </li>
              <li>
                <span className="text-foreground">Sign-in providers</span> — if you sign in with
                Apple or Google, they confirm your identity to us under their own privacy policies.
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
              account</span> in the app. Deleting your account removes your cards and their
              analytics, your contacts, leads, deals, tasks and appointments, and your sign-in
              links, and anonymizes your account so it can no longer be signed into. Server backups
              are overwritten on a rolling basis. To ask for deletion another way, email us.
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
              If you have questions about this Privacy Policy or your data, email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-foreground underline underline-offset-4"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              or visit our{" "}
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
