import type { Metadata } from "next";
import { GalleryAlbumClient } from "./gallery-album-client";

export const metadata: Metadata = {
  title: "Álbum na galeria — Copa 2026",
  description: "Veja figurinhas coladas e repetidas disponíveis para troca.",
};

type PageProps = {
  params: Promise<{ albumId: string }>;
};

export default async function GalleryAlbumPage({ params }: PageProps) {
  const { albumId } = await params;
  return <GalleryAlbumClient albumId={albumId} />;
}
