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
import { verifyEmailByToken } from "@/lib/email-verification";

export const metadata: Metadata = {
  title: "Confirmar e-mail — Copa 2026",
  description: "Confirme seu e-mail para acessar o álbum.",
};

type VerifyEmailPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const { token } = await searchParams;
  const result = token
    ? await verifyEmailByToken(token)
    : { ok: false as const, error: "Link inválido." };

  const success = result.ok;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>
              {success ? "E-mail confirmado!" : "Não foi possível confirmar"}
            </CardTitle>
            <CardDescription>
              {success
                ? `Sua conta ${result.email} está ativa. Agora você pode entrar.`
                : result.error}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="min-h-11 rounded-xl">
              <Link href={success ? "/album" : "/?signIn=1"}>
                {success ? "Ir para o álbum" : "Tentar entrar"}
              </Link>
            </Button>
            {!success && (
              <Button asChild variant="outline" className="min-h-11 rounded-xl">
                <Link href="/">Voltar ao início</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
