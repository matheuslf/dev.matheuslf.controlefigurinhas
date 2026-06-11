import type { EmailProviderSendVerificationRequestParams } from "@auth/core/providers";
import { Resend } from "resend";
import { emailFrom, resendApiKey } from "@/lib/env";

function formatFromAddress(from: string) {
  if (from.includes("<")) return from;
  return `Copa 2026 <${from}>`;
}

export async function sendMagicLinkEmail(
  params: EmailProviderSendVerificationRequestParams,
) {
  if (!resendApiKey || !emailFrom) {
    throw new Error("RESEND_API_KEY ou EMAIL_FROM não configurados.");
  }

  const { identifier: to, url } = params;
  const resend = new Resend(resendApiKey);
  const host = new URL(url).host;

  const { data, error } = await resend.emails.send({
    from: formatFromAddress(params.provider.from ?? emailFrom),
    to,
    subject: `Seu link de acesso — Copa 2026`,
    html: `
      <div style="font-family:Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#171717;">
        <h1 style="font-size:20px;margin:0 0 12px;">Entrar no álbum</h1>
        <p style="font-size:15px;line-height:1.5;color:#525252;margin:0 0 20px;">
          Clique no botão abaixo para acessar seu álbum de figurinhas em
          <strong>${host}</strong>. O link expira em 24 horas.
        </p>
        <p style="margin:0 0 24px;text-align:center;">
          <a href="${url}" style="display:inline-block;background:#d4af37;color:#0a0a0a;font-weight:700;text-decoration:none;padding:12px 24px;border-radius:12px;">
            Entrar na minha conta
          </a>
        </p>
        <p style="font-size:13px;line-height:1.5;color:#737373;margin:0;">
          Se o botão não funcionar, copie e cole este link no navegador:<br/>
          <a href="${url}" style="color:#1e3a8a;word-break:break-all;">${url}</a>
        </p>
        <p style="font-size:12px;color:#a3a3a3;margin:24px 0 0;">
          Se você não solicitou este e-mail, pode ignorá-lo com segurança.
        </p>
      </div>
    `,
    text: `Entrar no álbum Copa 2026\n\nAbra este link no navegador (válido por 24h):\n${url}\n`,
  });

  if (error) {
    console.error("[auth-email] Resend error:", error);
    throw new Error(error.message);
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[auth-email] Magic link enviado:", { to, id: data?.id });
  }
}
