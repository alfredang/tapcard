import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toast";

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://tapcard.tertiaryinfotech.com";
const DESCRIPTION =
  "Create, share and track smart digital business cards with a built-in CRM. Share by QR code, save to contacts, capture leads and manage your pipeline. Free plan, no app required.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tapcard - Smart Digital Business Cards with a Built-in CRM",
    template: "%s | Tapcard",
  },
  description: DESCRIPTION,
  keywords: [
    "digital business card",
    "QR business card",
    "virtual business card",
    "electronic business card",
    "networking app",
    "lead capture",
    "business card CRM",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Tapcard",
    title: "Tapcard - Smart Digital Business Cards with a Built-in CRM",
    description: DESCRIPTION,
    images: [{ url: "/screenshot.png", width: 1200, height: 630, alt: "Tapcard" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tapcard - Smart Digital Business Cards with a Built-in CRM",
    description: DESCRIPTION,
    images: ["/screenshot.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// Apply the saved theme before paint to avoid a flash. Light is the default.
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${sans.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
