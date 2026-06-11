import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { ensureDefaultAlbum } from "@/lib/ensure-default-album";
import { authUrl, emailFrom, resendApiKey } from "@/lib/env";
import { normalizeEmail } from "@/lib/password";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type EmailVerificationResult =
  | { ok: true }
  | { ok: false; error: string };

function formatFromAddress(from: string) {
  if (from.includes("<")) return from;
  return `Copa 2026 <${from}>`;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createAndSendVerificationEmail(
  email: string,
  name?: string | null,
): Promise<EmailVerificationResult> {
  if (!resendApiKey || !emailFrom) {
    return {
      ok: false,
      error: "Envio de e-mail não configurado (RESEND_API_KEY / EMAIL_FROM).",
    };
  }

  const normalized = normalizeEmail(email);
  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier: normalized },
  });

  await prisma.verificationToken.create({
    data: { identifier: normalized, token, expires },
  });

  const verifyUrl = `${authUrl.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(token)}`;
  const host = new URL(authUrl).host;
  const greeting = name?.trim() ? `Olá, ${name.trim()}!` : "Olá!";

  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: formatFromAddress(emailFrom),
    to: normalized,
    subject: "Confirme seu e-mail — Copa 2026",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171717;">
        <h1 style="font-size:20px;margin:0 0 12px;">Confirme sua conta</h1>
        <p style="font-size:15px;line-height:1.5;color:#525252;margin:0 0 20px;">
          ${greeting} Clique no botão abaixo para confirmar seu e-mail e acessar o álbum de figurinhas em
          <strong>${host}</strong>. O link expira em 24 horas.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${verifyUrl}" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;">
            Confirmar meu e-mail
          </a>
        </p>
        <p style="font-size:13px;line-height:1.5;color:#737373;margin:0;">
          Se o botão não funcionar, copie e cole este link no navegador:<br/>
          <a href="${verifyUrl}" style="color:#1e3a8a;word-break:break-all;">${verifyUrl}</a>
        </p>
        <p style="font-size:12px;color:#a3a3a3;margin:24px 0 0;">
          Se você não criou esta conta, pode ignorar este e-mail.
        </p>
      </div>
    `,
    text: `${greeting}\n\nConfirme seu e-mail abrindo este link (válido por 24h):\n${verifyUrl}\n`,
  });

  if (error) {
    console.error("[email-verification] Resend error:", error);
    return { ok: false, error: error.message };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[email-verification] E-mail enviado:", {
      to: normalized,
      id: data?.id,
    });
  }

  return { ok: true };
}

export async function verifyEmailByToken(
  token: string,
): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Link inválido." };
  }

  const record = await prisma.verificationToken.findFirst({
    where: { token: trimmed, expires: { gt: new Date() } },
  });

  if (!record) {
    return { ok: false, error: "Link inválido ou expirado." };
  }

  const user = await prisma.user.findUnique({
    where: { email: record.identifier },
  });

  if (!user) {
    return { ok: false, error: "Conta não encontrada." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    }),
  ]);

  await ensureDefaultAlbum(user.id);

  return { ok: true, email: record.identifier };
}

export async function isEmailPendingVerification(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    select: { passwordHash: true, emailVerified: true },
  });
  return Boolean(user?.passwordHash && !user.emailVerified);
}
