"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AuthModalContextProvider } from "@/components/auth/auth-modal-context";
import { AuthModal } from "@/components/auth/auth-modal";
import {
  authModalCallbackFromParams,
  hasAuthModalParams,
  stripAuthModalParams,
} from "@/lib/auth-callback-url";

import { authErrorMessage } from "@/lib/auth-errors";

function AuthModalFromUrl({
  onOpen,
  onAuthError,
}: {
  onOpen: (url: string) => void;
  onAuthError: (message: string) => void;
}) {
  const searchParams = useSearchParams();

  React.useEffect(() => {
    const authError = searchParams.get("error");
    const errorMessage = authErrorMessage(authError);
    if (errorMessage) {
      queueMicrotask(() => onAuthError(errorMessage));
    }

    const callback = authModalCallbackFromParams(searchParams);
    if (!callback) return;
    queueMicrotask(() => onOpen(callback));
  }, [searchParams, onOpen, onAuthError]);

  return null;
}

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [callbackUrl, setCallbackUrl] = React.useState("/album");
  const [authError, setAuthError] = React.useState<string | null>(null);

  const openAuthModal = React.useCallback((url = "/album") => {
    setCallbackUrl(url);
    setAuthError(null);
    setOpen(true);
  }, []);

  const showAuthError = React.useCallback((message: string) => {
    setAuthError(message);
    setOpen(true);
  }, []);

  const closeAuthModal = React.useCallback(() => {
    setOpen(false);
    setAuthError(null);
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const hadAuthParams =
      hasAuthModalParams(params) || params.has("error") || params.has("code");
    if (!hadAuthParams) return;

    params.delete("error");
    params.delete("code");
    const cleaned = stripAuthModalParams(params);
    const query = cleaned.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router]);

  const value = React.useMemo(
    () => ({ openAuthModal, closeAuthModal }),
    [openAuthModal, closeAuthModal],
  );

  return (
    <AuthModalContextProvider value={value}>
      {children}
      <React.Suspense fallback={null}>
        <AuthModalFromUrl onOpen={openAuthModal} onAuthError={showAuthError} />
      </React.Suspense>
      <AuthModal
        open={open}
        callbackUrl={callbackUrl}
        authError={authError}
        onClose={closeAuthModal}
      />
    </AuthModalContextProvider>
  );
}
