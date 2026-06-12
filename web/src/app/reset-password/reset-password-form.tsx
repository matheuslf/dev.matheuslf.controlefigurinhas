"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resetPasswordByTokenAction } from "@/app/actions/auth";

const inputClassName =
  "min-h-12 w-full rounded-xl border-2 border-border bg-card-muted px-3 text-base outline-none focus:border-primary";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const [messageTone, setMessageTone] = React.useState<"success" | "error">(
    "error",
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessageTone("error");
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const result = await resetPasswordByTokenAction(token, password);
      if (!result.ok) {
        setMessageTone("error");
        setMessage(result.error);
        return;
      }

      setMessageTone("success");
      setMessage("Senha redefinida com sucesso! Redirecionando para entrar…");
      window.setTimeout(() => router.push("/?signIn=1"), 1500);
    } catch {
      setMessageTone("error");
      setMessage("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Nova senha
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
        Confirmar nova senha
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
        disabled={loading}
      >
        {loading ? "Salvando…" : "Redefinir senha"}
      </Button>
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
    </form>
  );
}
