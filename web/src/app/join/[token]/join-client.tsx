"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getAlbumPreview, joinAlbum } from "@/app/actions/albums";
import { TOTAL_STICKERS } from "@/data/selections";

type JoinClientProps = {
  token: string;
};

export function JoinClient({ token }: JoinClientProps) {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const asOwner = searchParams.get("owner") === "1";
  const [preview, setPreview] = React.useState<Awaited<
    ReturnType<typeof getAlbumPreview>
  > | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [joining, setJoining] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getAlbumPreview(token)
      .then(setPreview)
      .finally(() => setLoading(false));
  }, [token]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const albumId = await joinAlbum(token, { asOwner });
      router.push(`/album?albumId=${albumId}`);
    } catch {
      setError("Não foi possível entrar no álbum.");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center text-muted">
          Carregando convite…
        </main>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-xl font-bold">Convite inválido</h1>
          <p className="text-muted">Este link expirou ou foi revogado.</p>
          <Button asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-12">
        <Card>
          <CardHeader>
            <CardTitle>{preview.name}</CardTitle>
            <CardDescription>
              {preview.memberCount}{" "}
              {preview.memberCount === 1 ? "membro" : "membros"} no álbum
              {asOwner && " — convite como dono"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-sm text-muted">Progresso do grupo</p>
              <Progress value={preview.groupPercent} className="h-2.5" />
              <p className="mt-2 text-sm tabular-nums text-muted">
                {preview.groupOwnedCount} de {TOTAL_STICKERS} figurinhas (
                {preview.groupPercent}%)
              </p>
            </div>

            {status === "authenticated" ? (
              <>
                <Button
                  className="min-h-12 rounded-xl"
                  disabled={joining}
                  onClick={handleJoin}
                >
                  {joining
                    ? "Entrando…"
                    : asOwner
                      ? "Entrar como dono"
                      : "Entrar no álbum"}
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Entre na sua conta para participar e ver repetidas dos membros.
                </p>
                <Button
                  className="min-h-12 rounded-xl"
                  onClick={() =>
                    openAuthModal(`/join/${token}${asOwner ? "?owner=1" : ""}`)
                  }
                >
                  Entrar para participar
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
