import type { Metadata } from "next";
import { Suspense } from "react";
import { AlbumClient } from "./album-client";

export const metadata: Metadata = {
  title: "Meu álbum — Copa 2026",
  description: "Marque figurinhas e acompanhe o progresso do álbum.",
};

export default function AlbumPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          Carregando álbum…
        </div>
      }
    >
      <AlbumClient />
    </Suspense>
  );
}
