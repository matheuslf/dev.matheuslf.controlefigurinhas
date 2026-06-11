"use client";

import * as React from "react";
import type { AlbumSummary } from "@/app/actions/albums";

type AlbumSwitcherProps = {
  albums: AlbumSummary[];
  activeAlbumId: string | null;
  onChange: (albumId: string | null) => void;
};

export function AlbumSwitcher({
  albums,
  activeAlbumId,
  onChange,
}: AlbumSwitcherProps) {
  if (albums.length <= 1) return null;

  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
      Álbum ativo
      <select
        value={activeAlbumId ?? ""}
        onChange={(e) => onChange(e.target.value || null)}
        className="min-h-11 rounded-xl border-2 border-border bg-card-muted px-3 text-base outline-none focus:border-primary"
      >
        {albums.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name} ({a.memberCount} {a.memberCount === 1 ? "membro" : "membros"})
          </option>
        ))}
      </select>
    </label>
  );
}
