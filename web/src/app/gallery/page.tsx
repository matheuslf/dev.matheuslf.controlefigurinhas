import type { Metadata } from "next";
import { GalleryClient } from "./gallery-client";

export const metadata: Metadata = {
  title: "Galeria de álbuns — Copa 2026",
  description: "Explore álbuns compartilhados e solicite trocas de figurinhas.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
