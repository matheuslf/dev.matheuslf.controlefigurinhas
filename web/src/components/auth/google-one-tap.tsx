"use client";

import * as React from "react";
import Script from "next/script";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const DISMISS_KEY = "one-tap-dismissed";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          prompt: (listener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function GoogleOneTap() {
  const { status } = useSession();
  const router = useRouter();
  const [scriptReady, setScriptReady] = React.useState(false);
  const initialized = React.useRef(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  React.useEffect(() => {
    if (status === "authenticated" || !clientId || !scriptReady) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    if (initialized.current || !window.google?.accounts?.id) return;

    initialized.current = true;

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response: { credential: string }) => {
        const result = await signIn("google-one-tap", {
          credential: response.credential,
          redirect: false,
        });
        if (!result?.error) {
          router.push("/album");
          router.refresh();
        }
      },
      auto_select: true,
      cancel_on_tap_outside: false,
      context: "signin",
    });

    window.google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        sessionStorage.setItem(DISMISS_KEY, "1");
      }
    });
  }, [status, scriptReady, clientId, router]);

  if (status === "authenticated" || !clientId) return null;

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onReady={() => setScriptReady(true)}
    />
  );
}
