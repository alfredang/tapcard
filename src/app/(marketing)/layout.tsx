import Link from "next/link";
import { SiteHeader } from "@/components/marketing/site-header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/60 bg-surface/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Tapcard. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#pricing" className="hover:text-foreground">
              Pricing
            </a>
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-border/60 px-4 py-4 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <a
            href="https://www.tertiaryinfotech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary hover:underline"
          >
            Tertiary Infotech Academy Pte Ltd
          </a>
        </div>
      </footer>
    </div>
  );
}
