import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { validatePasswordResetToken } from "@/lib/password-reset";
import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";

export const metadata: Metadata = {
  title: "Redefinir senha — Copa 2026",
  description: "Defina uma nova senha para sua conta.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { token } = await searchParams;
  const result = token
    ? await validatePasswordResetToken(token)
    : { ok: false as const, error: "Link inválido." };

  const valid = result.ok;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {valid ? "Nova senha" : "Não foi possível redefinir"}
            </CardTitle>
            <CardDescription>
              {valid
                ? "Escolha uma nova senha para sua conta."
                : result.error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {valid && token ? (
              <ResetPasswordForm token={token} />
            ) : (
              <>
                <Button asChild className="min-h-11 rounded-xl">
                  <Link href="/?signIn=1">Solicitar novo link</Link>
                </Button>
                <Button asChild variant="outline" className="min-h-11 rounded-xl">
                  <Link href="/">Voltar ao início</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
