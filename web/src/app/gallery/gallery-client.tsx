"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { SiteHeader } from "@/components/site-header";
import { GalleryAlbumCard } from "@/components/gallery/gallery-album-card";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  listAlbumsVisitedAsVisitor,
  listPublicGalleryAlbums,
  type GalleryAlbumSummary,
  type VisitedAlbumSummary,
} from "@/app/actions/gallery";

export function GalleryClient() {
  const { status } = useSession();
  const [albums, setAlbums] = React.useState<GalleryAlbumSummary[]>([]);
  const [visited, setVisited] = React.useState<VisitedAlbumSummary[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    Promise.all([
      listPublicGalleryAlbums(),
      status === "authenticated"
        ? listAlbumsVisitedAsVisitor()
        : Promise.resolve([]),
    ])
      .then(([popular, visitedAlbums]) => {
        setAlbums(popular);
        setVisited(visitedAlbums);
      })
      .finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
            Galeria de álbuns
          </h1>
          <p className="mt-1 text-muted">
            Explore álbuns públicos, veja popularidade e retome os que você
            visitou como visitante — sem entrar como membro.
          </p>
        </div>

        {loading ? (
          <p className="text-muted">Carregando galeria…</p>
        ) : (
          <>
            {status === "authenticated" && visited.length > 0 && (
              <section className="flex flex-col gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    Álbuns que você visitou
                  </h2>
                  <p className="text-sm text-muted">
                    Álbuns abertos na galeria nos quais você ainda não é membro.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visited.map((album) => (
                    <GalleryAlbumCard
                      key={album.id}
                      album={album}
                      showVisitMeta
                    />
                  ))}
                </div>
              </section>
            )}

            <section className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  Populares na galeria
                </h2>
                <p className="text-sm text-muted">
                  Ordenados por número total de acessos.
                </p>
              </div>
              {albums.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center text-muted">
                    Nenhum álbum público na galeria ainda.
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {albums.map((album) => (
                    <GalleryAlbumCard key={album.id} album={album} />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
