import crypto from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { authUrl, emailFrom, resendApiKey } from "@/lib/env";
import { hashPassword, normalizeEmail, validatePassword } from "@/lib/password";

const TOKEN_TTL_MS = 60 * 60 * 1000;
const IDENTIFIER_PREFIX = "password-reset:";

export type PasswordResetResult =
  | { ok: true }
  | { ok: false; error: string };

function formatFromAddress(from: string) {
  if (from.includes("<")) return from;
  return `Copa 2026 <${from}>`;
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function resetIdentifier(email: string): string {
  return `${IDENTIFIER_PREFIX}${normalizeEmail(email)}`;
}

async function sendPasswordResetEmail(
  email: string,
  name?: string | null,
): Promise<PasswordResetResult> {
  if (!resendApiKey || !emailFrom) {
    console.error("[password-reset] RESEND_API_KEY / EMAIL_FROM não configurados.");
    return { ok: true };
  }

  const normalized = normalizeEmail(email);
  const identifier = resetIdentifier(normalized);
  const token = generateToken();
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({
    where: { identifier },
  });

  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  const resetUrl = `${authUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  const host = new URL(authUrl).host;
  const greeting = name?.trim() ? `Olá, ${name.trim()}!` : "Olá!";

  const resend = new Resend(resendApiKey);
  const { data, error } = await resend.emails.send({
    from: formatFromAddress(emailFrom),
    to: normalized,
    subject: "Redefinir senha — Copa 2026",
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171717;">
        <h1 style="font-size:20px;margin:0 0 12px;">Redefinir sua senha</h1>
        <p style="font-size:15px;line-height:1.5;color:#525252;margin:0 0 20px;">
          ${greeting} Recebemos um pedido para redefinir a senha da sua conta em
          <strong>${host}</strong>. O link expira em 1 hora.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${resetUrl}" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;">
            Redefinir senha
          </a>
        </p>
        <p style="font-size:13px;line-height:1.5;color:#737373;margin:0;">
          Se o botão não funcionar, copie e cole este link no navegador:<br/>
          <a href="${resetUrl}" style="color:#1e3a8a;word-break:break-all;">${resetUrl}</a>
        </p>
        <p style="font-size:12px;color:#a3a3a3;margin:24px 0 0;">
          Se você não solicitou a redefinição, pode ignorar este e-mail.
        </p>
      </div>
    `,
    text: `${greeting}\n\nRedefina sua senha abrindo este link (válido por 1h):\n${resetUrl}\n`,
  });

  if (error) {
    console.error("[password-reset] Resend error:", error);
    return { ok: true };
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[password-reset] E-mail enviado:", {
      to: normalized,
      id: data?.id,
    });
  }

  return { ok: true };
}

export async function requestPasswordResetForEmail(
  email: string,
): Promise<PasswordResetResult> {
  const normalized = normalizeEmail(email);
  if (!normalized.includes("@")) {
    return { ok: false, error: "E-mail inválido." };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { passwordHash: true, name: true },
  });

  if (!user?.passwordHash) {
    return { ok: true };
  }

  return sendPasswordResetEmail(normalized, user.name);
}

export async function validatePasswordResetToken(
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Link inválido." };
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      token: trimmed,
      expires: { gt: new Date() },
      identifier: { startsWith: IDENTIFIER_PREFIX },
    },
  });

  if (!record) {
    return { ok: false, error: "Link inválido ou expirado." };
  }

  return { ok: true };
}

export async function resetPasswordByToken(
  token: string,
  newPassword: string,
): Promise<PasswordResetResult> {
  const passwordError = validatePassword(newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const trimmed = token.trim();
  if (!trimmed) {
    return { ok: false, error: "Link inválido." };
  }

  const record = await prisma.verificationToken.findFirst({
    where: {
      token: trimmed,
      expires: { gt: new Date() },
      identifier: { startsWith: IDENTIFIER_PREFIX },
    },
  });

  if (!record) {
    return { ok: false, error: "Link inválido ou expirado." };
  }

  const email = record.identifier.slice(IDENTIFIER_PREFIX.length);
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, passwordHash: true },
  });

  if (!user?.passwordHash) {
    return { ok: false, error: "Conta não encontrada." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    }),
    prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier },
    }),
  ]);

  return { ok: true };
}
