"use client";

import * as React from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  changeUserPassword,
  getUserProfile,
  resendVerificationEmail,
  updateUserProfile,
  type UserProfile,
} from "@/app/actions/auth";

const inputClassName =
  "min-h-11 w-full rounded-xl border-2 border-border bg-card-muted px-3 text-base outline-none focus:border-primary";

export function ProfileClient() {
  const { update: updateSession } = useSession();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [savingPassword, setSavingPassword] = React.useState(false);
  const [profileMessage, setProfileMessage] = React.useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(null);
  const [resendMessage, setResendMessage] = React.useState<string | null>(null);
  const [resending, setResending] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  React.useEffect(() => {
    getUserProfile()
      .then((p) => {
        setProfile(p);
        setName(p.name ?? "");
        setEmail(p.email);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    const result = await updateUserProfile({
      name,
      email: profile?.hasPassword ? email : undefined,
      currentPassword: profile?.hasPassword ? currentPassword : undefined,
    });
    setSavingProfile(false);
    if (!result.ok) {
      setProfileMessage(result.error);
      return;
    }
    setProfileMessage(
      result.needsEmailVerification
        ? "Perfil atualizado. Confirme o novo e-mail que enviamos."
        : "Perfil atualizado.",
    );
    setCurrentPassword("");
    const updated = await getUserProfile();
    setProfile(updated);
    setName(updated.name ?? "");
    setEmail(updated.email);
    await updateSession({ name: updated.name, email: updated.email });
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage("As senhas não coincidem.");
      return;
    }
    setSavingPassword(true);
    setPasswordMessage(null);
    const result = await changeUserPassword({
      currentPassword: profile?.hasPassword ? currentPassword : undefined,
      newPassword,
    });
    setSavingPassword(false);
    if (!result.ok) {
      setPasswordMessage(result.error);
      return;
    }
    setPasswordMessage(
      profile?.hasPassword ? "Senha alterada." : "Senha definida com sucesso.",
    );
    setNewPassword("");
    setConfirmPassword("");
    setCurrentPassword("");
    const updated = await getUserProfile();
    setProfile(updated);
  }

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center text-muted">
          Carregando perfil…
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold">Meu perfil</h1>
          <p className="mt-1 text-sm text-muted">
            Atualize seus dados e gerencie como você entra na conta.
          </p>
        </div>

        {profile.hasPassword && !profile.emailVerified && (
          <Card className="border-primary/30 bg-card-muted">
            <CardHeader>
              <CardTitle className="text-base">Confirme seu e-mail</CardTitle>
              <CardDescription>
                Enviamos um link para <strong>{profile.email}</strong>. Confirme
                para garantir o acesso à conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-10 rounded-xl"
                disabled={resending}
                onClick={async () => {
                  setResending(true);
                  setResendMessage(null);
                  const result = await resendVerificationEmail(profile.email);
                  setResending(false);
                  setResendMessage(
                    result.ok
                      ? "E-mail de confirmação reenviado."
                      : result.error,
                  );
                }}
              >
                {resending ? "Reenviando…" : "Reenviar e-mail de confirmação"}
              </Button>
              {resendMessage && (
                <p
                  className={
                    resendMessage.includes("reenviado")
                      ? "text-sm text-success"
                      : "text-sm text-destructive"
                  }
                >
                  {resendMessage}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Dados pessoais</CardTitle>
            <div className="flex flex-wrap gap-2">
              {profile.hasGoogle && <Badge variant="secondary">Google</Badge>}
              {profile.hasPassword && (
                <Badge variant="secondary">E-mail e senha</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-3">
              <label className="flex flex-col gap-2 text-sm font-medium">
                Nome
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!profile.hasPassword}
                  className={inputClassName}
                  required
                />
              </label>
              {!profile.hasPassword && (
                <p className="text-xs text-muted">
                  E-mail vinculado à conta Google e não pode ser alterado aqui.
                </p>
              )}
              {profile.hasPassword && email !== profile.email && (
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Senha atual (para alterar e-mail)
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClassName}
                  />
                </label>
              )}
              <Button type="submit" disabled={savingProfile} className="min-h-11 rounded-xl">
                {savingProfile ? "Salvando…" : "Salvar perfil"}
              </Button>
              {profileMessage && (
                <p
                  className={
                    profileMessage.includes("atualizado")
                      ? "text-sm text-success"
                      : "text-sm text-destructive"
                  }
                >
                  {profileMessage}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senha</CardTitle>
            <CardDescription>
              {profile.hasPassword
                ? "Altere a senha da sua conta."
                : "Defina uma senha para entrar também com e-mail."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
              {profile.hasPassword && (
                <label className="flex flex-col gap-2 text-sm font-medium">
                  Senha atual
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClassName}
                  />
                </label>
              )}
              <label className="flex flex-col gap-2 text-sm font-medium">
                {profile.hasPassword ? "Nova senha" : "Senha"}
                <input
                  type="password"
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={inputClassName}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Confirmar senha
                <input
                  type="password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={inputClassName}
                  required
                />
              </label>
              <Button
                type="submit"
                disabled={savingPassword}
                className="min-h-11 rounded-xl"
              >
                {savingPassword
                  ? "Salvando…"
                  : profile.hasPassword
                    ? "Alterar senha"
                    : "Definir senha"}
              </Button>
              {passwordMessage && (
                <p
                  className={
                    passwordMessage.includes("sucesso") ||
                    passwordMessage.includes("alterada")
                      ? "text-sm text-success"
                      : "text-sm text-destructive"
                  }
                >
                  {passwordMessage}
                </p>
              )}
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="min-h-10 rounded-lg">
            <Link href="/album">Voltar ao álbum</Link>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-10 rounded-lg text-muted"
            onClick={() => signOut({ callbackUrl: "/" })}
          >
            Sair da conta
          </Button>
        </div>
      </main>
    </div>
  );
}
