"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { AlbumShareHeaderActions } from "@/components/albums/album-share-header-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const { openAuthModal } = useAuthModal();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[var(--header-bg)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <Image
            src="/logo.png"
            alt="Copa 2026"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
          />
          <span className="text-lg">Copa 2026</span>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Álbum
          </Badge>
        </Link>
        <nav className="flex items-center gap-1 text-xs font-medium sm:gap-1.5 sm:text-sm">
          <Link
            href="/gallery"
            className="hidden rounded-md px-2 py-1 text-muted hover:bg-card hover:text-foreground sm:inline"
          >
            Galeria
          </Link>
          <Link
            href="/albums"
            className="hidden rounded-md px-2 py-1 text-muted hover:bg-card hover:text-foreground sm:inline"
          >
            Álbuns
          </Link>
          <Link
            href="/album"
            className="rounded-md bg-primary px-2.5 py-1 text-primary-foreground shadow-sm hover:bg-copa-gold-bright"
          >
            Álbum
          </Link>
          <AlbumShareHeaderActions />
          <ThemeToggle />
          {status === "authenticated" ? (
            <>
              <Link
                href="/trades"
                className="hidden rounded-md px-2 py-1 text-muted hover:bg-card hover:text-foreground sm:inline"
              >
                Trocas
              </Link>
              <Link
                href="/profile"
                className="hidden rounded-md px-2 py-1 text-muted hover:bg-card hover:text-foreground sm:inline"
              >
                Perfil
              </Link>
              <Button
                asChild
                variant="outline"
                className="min-h-8 h-8 rounded-md px-2 text-xs sm:min-h-9 sm:px-2.5 sm:text-sm"
              >
                <Link href="/profile">
                  {session.user?.name?.split(" ")[0] ?? "Perfil"}
                </Link>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="min-h-8 h-8 rounded-md px-2 text-xs text-muted sm:min-h-9 sm:px-2.5 sm:text-sm"
              onClick={() => openAuthModal("/album")}
            >
              Entrar
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
