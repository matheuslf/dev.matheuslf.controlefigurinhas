import Link from "next/link";
import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="copa-tricolor-bar" aria-hidden="true" />
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-colors hover:text-primary focus-visible:rounded-lg"
        >
          <Trophy className="size-5 text-primary" aria-hidden="true" />
          <span className="text-lg">Copa 2026</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            WE ARE 26
          </Badge>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-muted transition-colors hover:bg-card hover:text-foreground focus-visible:outline-offset-2"
          >
            Início
          </Link>
          <Link
            href="/album"
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground shadow-[var(--shadow-1)] transition-colors hover:bg-copa-gold-bright focus-visible:outline-offset-2"
          >
            Meu álbum
          </Link>
        </nav>
      </div>
    </header>
  );
}
