import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAlbum } from "@/lib/ensure-default-album";
import { authConfig } from "@/auth.config";
import { assertAuthEnv, authSecret, authUrl } from "@/lib/env";
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

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
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
  ],
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
