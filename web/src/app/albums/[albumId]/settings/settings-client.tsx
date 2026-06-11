"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  getAlbumById,
  getAlbumMembers,
  leaveAlbum,
  promoteToOwner,
  regenerateInviteToken,
  renameAlbum,
  setAlbumPublic,
} from "@/app/actions/albums";
import { buildAlbumInviteUrl } from "@/lib/album-invite";
import {
  getAlbumVisitorStats,
  type AlbumVisitorStats,
} from "@/app/actions/gallery";

type AlbumSettingsClientProps = {
  albumId: string;
};

export function AlbumSettingsClient({ albumId }: AlbumSettingsClientProps) {
  const router = useRouter();
  const [album, setAlbum] = React.useState<Awaited<
    ReturnType<typeof getAlbumById>
  > | null>(null);
  const [members, setMembers] = React.useState<Awaited<
    ReturnType<typeof getAlbumMembers>
  >>([]);
  const [name, setName] = React.useState("");
  const [inviteUrl, setInviteUrl] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [leaveError, setLeaveError] = React.useState<string | null>(null);
  const [leaving, setLeaving] = React.useState(false);
  const [visitorStats, setVisitorStats] = React.useState<AlbumVisitorStats | null>(
    null,
  );

  React.useEffect(() => {
    Promise.all([
      getAlbumById(albumId),
      getAlbumMembers(albumId),
      getAlbumVisitorStats(albumId),
    ])
      .then(([a, m, stats]) => {
        setAlbum(a);
        setMembers(m);
        setName(a.name);
        setInviteUrl(buildAlbumInviteUrl(a.inviteToken, "member"));
        setVisitorStats(stats);
      })
      .finally(() => setLoading(false));
  }, [albumId]);

  async function copyInvite() {
    await navigator.clipboard.writeText(inviteUrl);
  }

  async function handleRegenerate() {
    const token = await regenerateInviteToken(albumId);
    setInviteUrl(buildAlbumInviteUrl(token, "member"));
    const a = await getAlbumById(albumId);
    setAlbum(a);
  }

  async function handleRename(e: React.FormEvent) {
    e.preventDefault();
    await renameAlbum(albumId, name);
    const a = await getAlbumById(albumId);
    setAlbum(a);
  }

  if (loading || !album) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center text-muted">
          Carregando…
        </main>
      </div>
    );
  }

  const isOwner = album.role === "OWNER";
  const ownerCount = members.filter((m) => m.role === "OWNER").length;
  const isSoleOwner = isOwner && ownerCount === 1;
  const isOnlyMember = members.length === 1;
  const mustPromoteFirst = isSoleOwner && !isOnlyMember;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">{album.name}</h1>
          <Button asChild variant="outline" className="min-h-10 px-4 text-sm">
            <Link href={`/album?albumId=${albumId}`}>Voltar ao álbum</Link>
          </Button>
        </div>

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Visibilidade na galeria</CardTitle>
              <CardDescription>
                Álbuns públicos aparecem na galeria para outros colecionadores
                solicitarem trocas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={album.isPublic}
                  onChange={async (e) => {
                    await setAlbumPublic(albumId, e.target.checked);
                    const a = await getAlbumById(albumId);
                    setAlbum(a);
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                Exibir na galeria pública
              </label>
            </CardContent>
          </Card>
        )}

        {isOwner && (
          <Card>
            <CardHeader>
              <CardTitle>Renomear álbum</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRename} className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-11 flex-1 rounded-xl border-2 border-border px-3 outline-none focus:border-primary"
                />
                <Button type="submit">Salvar</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Link de convite</CardTitle>
            <CardDescription>
              Link para membros. Donos são adicionados via código em
              &quot;Adicionar dono&quot; no álbum.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <code className="break-all rounded-lg bg-card-muted p-3 text-sm">
              {inviteUrl}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={copyInvite}>
                Copiar link
              </Button>
              {isOwner && (
                <Button type="button" variant="outline" onClick={handleRegenerate}>
                  Gerar novo link
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Membros ({members.length})</CardTitle>
            <CardDescription>
              Pessoas que participam do álbum. Visitantes da galeria não
              aparecem aqui.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
              >
                <div>
                  <p className="font-medium">{m.name}</p>
                  <Badge variant="secondary" className="mt-1">
                    {m.role}
                  </Badge>
                </div>
                {isOwner && m.role === "MEMBER" && (
                  <Button
                    type="button"
                    variant="outline"
                    className="min-h-10 px-3 text-sm"
                    onClick={async () => {
                      await promoteToOwner(albumId, m.userId);
                      setMembers(await getAlbumMembers(albumId));
                    }}
                  >
                    Promover a owner
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {isOwner && visitorStats && (
          <Card>
            <CardHeader>
              <CardTitle>Popularidade e visitantes</CardTitle>
              <CardDescription>
                {visitorStats.viewCount} acessos totais ·{" "}
                {visitorStats.uniqueVisitors} visitantes únicos na galeria
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {visitorStats.visitors.length === 0 ? (
                <p className="text-sm text-muted">
                  Nenhum visitante registrado ainda.
                </p>
              ) : (
                visitorStats.visitors.map((visitor) => (
                  <div
                    key={visitor.userId}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border p-3"
                  >
                    <div>
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-xs text-muted">
                        {visitor.visitCount}{" "}
                        {visitor.visitCount === 1 ? "visita" : "visitas"} ·
                        última{" "}
                        {new Date(visitor.lastVisitedAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                    <Badge variant="outline">Visitante</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2">
          {mustPromoteFirst && (
            <p className="text-sm text-muted">
              Você é o único dono deste álbum. Promova outro membro a dono antes
              de sair.
            </p>
          )}
          {leaveError && (
            <p className="text-sm text-destructive" role="alert">
              {leaveError}
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={mustPromoteFirst || leaving}
            className="border-destructive text-destructive hover:bg-destructive/10 disabled:opacity-50"
            onClick={async () => {
              const confirmMessage = isSoleOwner && isOnlyMember
                ? "Excluir este álbum? Essa ação não pode ser desfeita."
                : "Sair deste álbum?";
              if (!window.confirm(confirmMessage)) return;

              setLeaveError(null);
              setLeaving(true);
              try {
                await leaveAlbum(albumId);
                router.push("/albums");
              } catch (error) {
                setLeaveError(
                  error instanceof Error
                    ? error.message
                    : "Não foi possível sair do álbum.",
                );
              } finally {
                setLeaving(false);
              }
            }}
          >
            {leaving
              ? "Saindo…"
              : isSoleOwner && isOnlyMember
                ? "Excluir álbum"
                : "Sair deste álbum"}
          </Button>
        </div>
      </main>
    </div>
  );
}
