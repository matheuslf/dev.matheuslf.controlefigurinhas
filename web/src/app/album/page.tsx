import type { Metadata } from "next";
import { AlbumClient } from "./album-client";

export const metadata: Metadata = {
  title: "Meu álbum — Copa 2026",
  description: "Marque figurinhas e acompanhe o progresso do álbum.",
};

export default function AlbumPage() {
  return <AlbumClient />;
}
