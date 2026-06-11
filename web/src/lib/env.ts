/** Variáveis de ambiente com fallbacks para nomes comuns. */

export const databaseUrl =
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  process.env.DATABASE_URL_UNPOOLED;

export const authSecret =
  process.env.AUTH_SECRET ??
  process.env.AUTHJS_SECRET ??
  process.env.NEXT_AUTH_SECRET;

export const authUrl =
  process.env.AUTH_URL ??
  process.env.AUTHJS_URL ??
  process.env.NEXT_PUBLIC_URL ??
  "http://localhost:3000";

export const googleClientId =
  process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;

export const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

export const resendApiKey = process.env.RESEND_API_KEY;
export const emailFrom = process.env.EMAIL_FROM;

export const publicGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export function assertAuthEnv() {
  if (!authSecret) {
    console.warn("[auth] AUTH_SECRET (ou AUTHJS_SECRET) não configurado.");
  }
  if (!googleClientId || !googleClientSecret) {
    console.warn(
      "[auth] Google OAuth não configurado. Use AUTH_GOOGLE_ID/AUTH_GOOGLE_SECRET ou GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET.",
    );
  }
  if (!databaseUrl) {
    console.warn("[auth] DATABASE_URL ou POSTGRES_URL não configurado.");
  }
}
