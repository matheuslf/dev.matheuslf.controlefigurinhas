"use client";

import { AlbumShareActions } from "@/components/albums/album-share-actions";
import { useAlbumShareTarget } from "@/components/albums/album-share-context";

export function AlbumShareHeaderActions() {
  const target = useAlbumShareTarget();
  if (!target) return null;

  return (
    <AlbumShareActions
      variant="icons"
      albumId={target.albumId}
      albumName={target.albumName}
      inviteToken={target.inviteToken}
      isOwner={target.isOwner}
    />
  );
}
