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
import { JoinOwnerCodeCard } from "@/components/albums/join-owner-code-card";
import {
  createAlbum,
  listMyAlbums,
  type AlbumSummary,
} from "@/app/actions/albums";

export function AlbumsClient() {
  const router = useRouter();
  const [albums, setAlbums] = React.useState<AlbumSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newName, setNewName] = React.useState("");
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    listMyAlbums()
      .then(setAlbums)
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const id = await createAlbum(newName);
      setNewName("");
      router.push(`/albums/${id}/settings`);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Meus álbuns</h1>
          <p className="mt-1 text-muted">
            Álbuns compartilhados com múltiplos owners para trocar repetidas.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Criar álbum compartilhado</CardTitle>
            <CardDescription>
              Convide amigos e família pelo link de convite.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Álbum da família"
                className="min-h-12 flex-1 rounded-xl border-2 border-border bg-card-muted px-3 outline-none focus:border-primary"
              />
              <Button type="submit" disabled={creating} className="min-h-12 rounded-xl">
                {creating ? "Criando…" : "Criar"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <JoinOwnerCodeCard />

        {loading ? (
          <p className="text-muted">Carregando…</p>
        ) : (
          <div className="flex flex-col gap-3">
            {albums.map((album) => (
              <Card key={album.id}>
                <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
                  <div>
                    <CardTitle className="text-lg">{album.name}</CardTitle>
                    <CardDescription>
                      {album.memberCount}{" "}
                      {album.memberCount === 1 ? "membro" : "membros"}
                    </CardDescription>
                  </div>
                  <Badge variant={album.role === "OWNER" ? "default" : "secondary"}>
                    {album.role === "OWNER" ? "Owner" : "Membro"}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" className="min-h-10 rounded-lg px-3 text-sm">
                    <Link href={`/album?albumId=${album.id}`}>Abrir álbum</Link>
                  </Button>
                  <Button asChild variant="ghost" className="min-h-10 rounded-lg px-3 text-sm">
                    <Link href={`/gallery/${album.id}`}>Ver na galeria</Link>
                  </Button>
                  <Button asChild variant="ghost" className="min-h-10 rounded-lg px-3 text-sm">
                    <Link href={`/albums/${album.id}/settings`}>Configurações</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
