import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="text-lg">Copa 2026</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Álbum
          </Badge>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg px-3 py-2 text-muted hover:bg-card hover:text-foreground"
          >
            Início
          </Link>
          <Link
            href="/album"
            className="rounded-lg bg-primary px-4 py-2 text-white shadow-sm hover:bg-primary/90"
          >
            Meu álbum
          </Link>
        </nav>
      </div>
    </header>
  );
}
