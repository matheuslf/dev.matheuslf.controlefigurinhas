"use client";

import * as React from "react";

export type AlbumShareTarget = {
  albumId: string;
  albumName: string;
  inviteToken: string;
  isOwner: boolean;
};

type AlbumShareContextValue = {
  target: AlbumShareTarget | null;
  setTarget: (target: AlbumShareTarget | null) => void;
};

const AlbumShareContext = React.createContext<AlbumShareContextValue | null>(
  null,
);

export function AlbumShareProvider({ children }: { children: React.ReactNode }) {
  const [target, setTarget] = React.useState<AlbumShareTarget | null>(null);
  const value = React.useMemo(
    () => ({ target, setTarget }),
    [target],
  );
  return (
    <AlbumShareContext.Provider value={value}>
      {children}
    </AlbumShareContext.Provider>
  );
}

export function useAlbumShareTarget() {
  const ctx = React.useContext(AlbumShareContext);
  if (!ctx) {
    throw new Error("useAlbumShareTarget must be used within AlbumShareProvider");
  }
  return ctx.target;
}

export function useSetAlbumShareTarget() {
  const ctx = React.useContext(AlbumShareContext);
  if (!ctx) {
    throw new Error(
      "useSetAlbumShareTarget must be used within AlbumShareProvider",
    );
  }
  return ctx.setTarget;
}
