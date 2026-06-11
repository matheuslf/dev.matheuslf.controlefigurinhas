import NextAuth, { CredentialsSignin } from "next-auth";
import Google from "next-auth/providers/google";
import Resend from "next-auth/providers/resend";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAlbum } from "@/lib/ensure-default-album";
import { authConfig } from "@/auth.config";
import {
  assertAuthEnv,
  authSecret,
  authUrl,
  googleClientId,
  googleClientSecret,
  publicGoogleClientId,
  resendApiKey,
  emailFrom,
} from "@/lib/env";
import { sendMagicLinkEmail } from "@/lib/auth-email";
import { normalizeEmail, verifyPassword } from "@/lib/password";

class EmailNotVerifiedError extends CredentialsSignin {
  code = "email_not_verified";
}

assertAuthEnv();

/** Auth.js lê AUTH_URL nativamente — sincroniza a partir dos aliases do .env */
if (!process.env.AUTH_URL) {
  process.env.AUTH_URL = authUrl;
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = authUrl;
}

const googleClient = publicGoogleClientId
  ? new OAuth2Client(publicGoogleClientId)
  : null;

const providers = [];

if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

if (resendApiKey && emailFrom) {
  const fromAddress = emailFrom.includes("<")
    ? emailFrom
    : `Copa 2026 <${emailFrom}>`;

  providers.push(
    Resend({
      apiKey: resendApiKey,
      from: fromAddress,
      sendVerificationRequest: sendMagicLinkEmail,
    }),
  );
}

providers.push(
  Credentials({
    id: "credentials",
    name: "Email e senha",
    credentials: {
      email: { label: "E-mail", type: "email" },
      password: { label: "Senha", type: "password" },
    },
    async authorize(credentials) {
      const email =
        typeof credentials?.email === "string"
          ? normalizeEmail(credentials.email)
          : "";
      const password =
        typeof credentials?.password === "string" ? credentials.password : "";

      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return null;

      if (!user.emailVerified) {
        throw new EmailNotVerifiedError();
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
);

if (publicGoogleClientId && googleClient) {
  providers.push(
    Credentials({
      id: "google-one-tap",
      name: "Google One Tap",
      credentials: {
        credential: { type: "text" },
      },
      async authorize(credentials) {
        const token = credentials?.credential;
        if (!token || typeof token !== "string") return null;

        if (!publicGoogleClientId || !googleClient) return null;

        try {
          const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: publicGoogleClientId,
          });
          const payload = ticket.getPayload();
          if (!payload?.email) return null;

          const email = payload.email;
          const name = payload.name ?? null;
          const image = payload.picture ?? null;
          const googleSub = payload.sub;

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: { email, name, image, emailVerified: new Date() },
            });
          } else if (!user.image && image) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { name: name ?? user.name, image },
            });
          }

          if (googleSub) {
            await prisma.account.upsert({
              where: {
                provider_providerAccountId: {
                  provider: "google",
                  providerAccountId: googleSub,
                },
              },
              create: {
                userId: user.id,
                type: "oauth",
                provider: "google",
                providerAccountId: googleSub,
                id_token: token,
              },
              update: { id_token: token },
            });
          }

          await ensureDefaultAlbum(user.id);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      if (trigger === "update" && session) {
        if (session.name !== undefined) token.name = session.name;
        if (session.email !== undefined) token.email = session.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        if (token.name !== undefined) {
          session.user.name = token.name as string | null;
        }
        if (token.email !== undefined && token.email !== null) {
          session.user.email = token.email as string;
        }
        if (token.picture !== undefined) {
          session.user.image = token.picture as string | null;
        }
      }
      return session;
    },
    async signIn({ user }) {
      if (user.id) {
        await ensureDefaultAlbum(user.id);
      }
      return true;
    },
  },
  secret: authSecret,
});

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}
