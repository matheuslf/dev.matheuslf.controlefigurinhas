import type { NextAuthConfig } from "next-auth";
import {
  authSecret,
  googleClientId,
  googleClientSecret,
  publicGoogleClientId,
  resendApiKey,
  emailFrom,
} from "@/lib/env";

/** Config compartilhada — compatível com Edge (middleware). Sem Prisma. */
export const authConfig = {
  pages: { signIn: "/" },
  trustHost: true,
  secret: authSecret,
  providers: [],
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        const target = url.startsWith("/") ? new URL(url, baseUrl) : new URL(url);
        const base = new URL(baseUrl);

        if (target.origin === base.origin) {
          if (
            target.pathname === "/" &&
            target.searchParams.has("callbackUrl") &&
            target.searchParams.get("signIn") !== "1"
          ) {
            target.searchParams.set("signIn", "1");
            const cb = target.searchParams.get("callbackUrl");
            if (cb) {
              const cbUrl = cb.startsWith("/")
                ? new URL(cb, baseUrl)
                : new URL(cb);
              target.searchParams.set(
                "callbackUrl",
                cbUrl.pathname + cbUrl.search,
              );
            }
          }
          return target.toString();
        }
      } catch {
        /* fall through */
      }
      return baseUrl;
    },
  },
} satisfies NextAuthConfig;

export const hasGoogleProvider = Boolean(googleClientId && googleClientSecret);
export const hasEmailProvider = Boolean(resendApiKey && emailFrom);
export const hasOneTapProvider = Boolean(publicGoogleClientId);
