"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { authErrorMessage } from "@/lib/auth-errors";
import { normalizeCallbackUrl } from "@/lib/auth-callback-url";
import {
  checkEmailPendingVerification,
  registerUser,
  requestPasswordReset,
  resendVerificationEmail,
} from "@/app/actions/auth";

type SignInFormProps = {
  callbackUrl?: string;
  initialError?: string | null;
  onClose?: () => void;
};

type AuthMode = "login" | "register" | "forgot";

const inputClassName =
  "min-h-12 w-full rounded-xl border-2 border-border bg-card-muted px-3 text-base outline-none focus:border-primary";

export function SignInForm({
  callbackUrl = "/album",
  initialError = null,
  onClose,
}: SignInFormProps) {
  const redirectTo = normalizeCallbackUrl(callbackUrl);
  const [mode, setMode] = React.useState<AuthMode>("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageTone, setMessageTone] = React.useState<"success" | "error">(
    "error",
  );
  const [showResendVerification, setShowResendVerification] =
    React.useState(false);

  React.useEffect(() => {
    if (initialError) {
      setMessage(initialError);
      setMessageTone("error");
    }
  }, [initialError]);

  function clearMessage() {
    setMessage(null);
    setShowResendVerification(false);
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    clearMessage();
    setPassword("");
    setConfirmPassword("");
  }

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading("login");
    clearMessage();

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: redirectTo,
      });

      if (!result?.ok || result.error) {
        setMessageTone("error");
        const pendingVerification = await checkEmailPendingVerification(
          email.trim(),
        );
        if (pendingVerification) {
          setMessage(
            "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
          );
          setShowResendVerification(true);
        } else {
          setMessage(
            result?.error === "CredentialsSignin"
              ? "E-mail ou senha incorretos."
              : authErrorMessage(result?.error) ?? "Não foi possível entrar.",
          );
        }
        return;
      }

      window.location.href = redirectTo;
    } catch {
      setMessageTone("error");
      setMessage("Erro de rede. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleResendVerification() {
    if (!email.trim()) {
      setMessageTone("error");
      setMessage("Informe o e-mail usado no cadastro.");
      return;
    }
    setLoading("resend");
    clearMessage();
    try {
      const result = await resendVerificationEmail(email.trim());
      if (!result.ok) {
        setMessageTone("error");
        setMessage(result.error);
        return;
      }
      setMessageTone("success");
      setMessage("E-mail de confirmação reenviado. Verifique sua caixa de entrada.");
      setShowResendVerification(true);
    } catch {
      setMessageTone("error");
      setMessage("Erro ao reenviar. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading("forgot");
    clearMessage();

    try {
      const result = await requestPasswordReset(email.trim());
      if (!result.ok) {
        setMessageTone("error");
        setMessage(result.error);
        return;
      }

      setMessageTone("success");
      setMessage(
        "Se existir uma conta com este e-mail, enviaremos instruções para redefinir sua senha.",
      );
    } catch {
      setMessageTone("error");
      setMessage("Erro de rede. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessageTone("error");
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading("register");
    clearMessage();

    try {
      const result = await registerUser(name, email, password);
      if (!result.ok) {
        setMessageTone("error");
        setMessage(result.error);
        return;
      }

      setMessageTone("success");
      setMessage(
        "Conta criada! Enviamos um e-mail de confirmação. Clique no link para ativar sua conta.",
      );
      setShowResendVerification(true);
      setMode("login");
      setPassword("");
      setConfirmPassword("");
    } catch {
      setMessageTone("error");
      setMessage("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      {mode !== "forgot" && (
        <div className="grid w-full grid-cols-2 gap-1 rounded-lg bg-card-muted p-1">
          <button
            type="button"
            className={
              mode === "login"
                ? "min-h-10 rounded-md bg-card text-sm font-medium shadow-sm"
                : "min-h-10 rounded-md text-sm text-muted"
            }
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={
              mode === "register"
                ? "min-h-10 rounded-md bg-card text-sm font-medium shadow-sm"
                : "min-h-10 rounded-md text-sm text-muted"
            }
            onClick={() => switchMode("register")}
          >
            Cadastrar
          </button>
        </div>
      )}

      {mode === "login" && (
        <form onSubmit={handleCredentialsLogin} className="flex w-full flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Senha
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClassName}
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
              onClick={() => switchMode("forgot")}
            >
              Esqueci minha senha
            </button>
          </div>
          <Button
            type="submit"
            className="min-h-12 rounded-xl"
            disabled={loading !== null}
          >
            {loading === "login" ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword} className="flex w-full flex-col gap-3">
          <p className="text-center text-sm text-muted">
            Informe o e-mail da sua conta. Se existir um cadastro, enviaremos um
            link para redefinir a senha.
          </p>
          <label className="flex flex-col gap-2 text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </label>
          <Button
            type="submit"
            className="min-h-12 rounded-xl"
            disabled={loading !== null}
          >
            {loading === "forgot" ? "Enviando…" : "Enviar instruções"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="min-h-10 text-muted"
            onClick={() => switchMode("login")}
          >
            Voltar para entrar
          </Button>
        </form>
      )}

      {mode === "register" && (
        <form onSubmit={handleRegister} className="flex w-full flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Nome
            <input
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            E-mail
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Senha
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              className={inputClassName}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Confirmar senha
            <input
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputClassName}
            />
          </label>
          <Button
            type="submit"
            className="min-h-12 rounded-xl"
            disabled={loading !== null}
          >
            {loading === "register" ? "Criando conta…" : "Criar conta"}
          </Button>
        </form>
      )}

      {message && (
        <p
          className={
            messageTone === "error"
              ? "text-center text-sm text-destructive"
              : "text-center text-sm text-muted"
          }
          role="status"
        >
          {message}
        </p>
      )}

      {showResendVerification && mode === "login" && (
        <Button
          type="button"
          variant="outline"
          className="min-h-10 w-full rounded-xl text-sm"
          disabled={loading !== null}
          onClick={handleResendVerification}
        >
          {loading === "resend" ? "Reenviando…" : "Reenviar e-mail de confirmação"}
        </Button>
      )}

      {onClose && (
        <Button type="button" variant="ghost" className="text-muted" onClick={onClose}>
          Continuar sem conta
        </Button>
      )}
    </div>
  );
}
