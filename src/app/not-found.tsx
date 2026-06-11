import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid-bg flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="gradient-text text-7xl font-extrabold">404</p>
      <h1 className="mt-4 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        The page or card you&apos;re looking for doesn&apos;t exist or may have
        been unpublished.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Back home</Link>
      </Button>
    </div>
  );
}
