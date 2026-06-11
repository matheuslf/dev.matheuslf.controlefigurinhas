const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Verification:
    "Link inválido ou expirado. Solicite um novo link mágico.",
  EmailSignin:
    "Não foi possível enviar o e-mail. Verifique RESEND_API_KEY e EMAIL_FROM.",
  Configuration:
    "Erro de configuração do login. Reinicie o servidor após ajustar o .env.",
  CredentialsSignin: "E-mail ou senha incorretos.",
  email_not_verified:
    "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  OAuthSignin: "Erro ao iniciar login com Google.",
  OAuthCallback: "Erro no retorno do Google. Verifique AUTH_URL e redirect URI.",
  Default: "Não foi possível entrar. Tente novamente.",
};

export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code?.trim()) return null;
  return AUTH_ERROR_MESSAGES[code] ?? AUTH_ERROR_MESSAGES.Default;
}
