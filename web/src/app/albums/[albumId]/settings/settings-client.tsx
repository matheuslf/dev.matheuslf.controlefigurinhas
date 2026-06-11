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
} from "@/app/actions/albums";
import { buildAlbumInviteUrl } from "@/lib/album-invite";

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

  React.useEffect(() => {
    Promise.all([getAlbumById(albumId), getAlbumMembers(albumId)])
      .then(([a, m]) => {
        setAlbum(a);
        setMembers(m);
        setName(a.name);
        setInviteUrl(buildAlbumInviteUrl(a.inviteToken, "member"));
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

        <Button
          type="button"
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive/10"
          onClick={async () => {
            await leaveAlbum(albumId);
            router.push("/albums");
          }}
        >
          Sair deste álbum
        </Button>
      </main>
    </div>
  );
}
