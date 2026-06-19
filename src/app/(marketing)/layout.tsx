import Link from "next/link";
import { Apple } from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";

const APP_STORE_URL =
  "https://apps.apple.com/us/app/tertiary-tapcard/id6780261599";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-border/60 bg-surface/40 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm sm:flex-row">
          <p>© {new Date().getFullYear()} Tapcard. All rights reserved.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
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
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Download Tertiary Tapcard on the App Store"
              className="focus-visible:outline-primary inline-flex h-11 items-center gap-2 rounded-lg bg-black px-3.5 text-left text-white shadow-sm transition hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <Apple className="h-6 w-6 shrink-0" aria-hidden="true" />
              <span className="leading-none">
                <span className="block text-[9px] font-medium tracking-[0.08em] uppercase">
                  Download on the
                </span>
                <span className="mt-0.5 block text-lg font-semibold tracking-normal">
                  App Store
                </span>
              </span>
            </a>
          </div>
        </div>
        <div className="border-border/60 text-muted-foreground border-t px-4 py-4 text-center text-xs">
          Powered by{" "}
          <a
            href="https://www.tertiaryinfotech.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-medium hover:underline"
          >
            Tertiary Infotech Academy Pte Ltd
          </a>
        </div>
      </footer>
    </div>
  );
}
