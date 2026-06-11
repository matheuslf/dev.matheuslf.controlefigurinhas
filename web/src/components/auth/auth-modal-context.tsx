"use client";

import * as React from "react";

type AuthModalContextValue = {
  openAuthModal: (callbackUrl?: string) => void;
  closeAuthModal: () => void;
};

const AuthModalContext = React.createContext<AuthModalContextValue | null>(null);

export function useAuthModal() {
  const ctx = React.useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return ctx;
}

export function AuthModalContextProvider({
  value,
  children,
}: {
  value: AuthModalContextValue;
  children: React.ReactNode;
}) {
  return (
    <AuthModalContext.Provider value={value}>{children}</AuthModalContext.Provider>
  );
}
