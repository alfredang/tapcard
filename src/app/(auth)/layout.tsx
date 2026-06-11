import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid-bg relative flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 text-lg font-bold"
      >
        <span className="gradient-primary flex h-9 w-9 items-center justify-center rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </span>
        <span className="gradient-text">Tapcard</span>
      </Link>
      <div className="relative w-full max-w-md">{children}</div>
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Tapcard. All rights reserved.
      </p>
    </div>
  );
}
