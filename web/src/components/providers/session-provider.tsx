"use client";

import { SessionProvider } from "next-auth/react";
import { AuthModalProvider } from "@/components/providers/auth-modal-provider";
import { AlbumShareProvider } from "@/components/albums/album-share-context";
import { StickerCollectionProvider } from "@/components/providers/sticker-collection-provider";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        <AlbumShareProvider>
          <StickerCollectionProvider>{children}</StickerCollectionProvider>
        </AlbumShareProvider>
      </AuthModalProvider>
    </SessionProvider>
  );
}
