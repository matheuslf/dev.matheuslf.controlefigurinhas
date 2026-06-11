"use client";

import * as React from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { AlbumFilterBar } from "@/components/album-filter-bar";
import { GalleryDuplicatesFeed } from "@/components/gallery/gallery-duplicates-feed";
import { StickerListGrouped } from "@/components/sticker-list-grouped";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TOTAL_STICKERS,
  resolveAlbumFilter,
} from "@/data/selections";
import {
  getPublicGalleryAlbum,
  type GalleryAlbumDetail,
} from "@/app/actions/gallery";
import type { StickerState } from "@/lib/sticker-storage";

const ALL = "all";

type GalleryAlbumClientProps = {
  albumId: string;
};

export function GalleryAlbumClient({ albumId }: GalleryAlbumClientProps) {
  const [album, setAlbum] = React.useState<GalleryAlbumDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectionId, setSelectionId] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    getPublicGalleryAlbum(albumId)
      .then(setAlbum)
      .finally(() => setLoading(false));
  }, [albumId]);

  const groupOwned = React.useMemo(
    () => new Set(album?.owned ?? []),
    [album?.owned],
  );

  const duplicateCounts = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const d of album?.duplicateTotals ?? []) {
      map.set(d.stickerNumber, d.totalDuplicates);
    }
    return map;
  }, [album?.duplicateTotals]);

  const getGroupState = React.useCallback(
    (num: number): StickerState => ({
      owned: groupOwned.has(num),
      duplicateCount: duplicateCounts.get(num) ?? 0,
    }),
    [groupOwned, duplicateCounts],
  );

  const filter = React.useMemo(
    () => resolveAlbumFilter(search, selectionId),
    [search, selectionId],
  );

  const visibleNumbers = filter.numbers;
  const hasActiveSearch = search.trim().length > 0;
  const groupMissing = TOTAL_STICKERS - groupOwned.size;

  function handleSelectionChange(value: string) {
    setSelectionId(value);
    setSearch("");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center text-muted">
          Carregando álbum…
        </main>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <p className="text-lg font-medium text-foreground">
            Álbum não encontrado ou não está público.
          </p>
          <Button asChild variant="outline">
            <Link href="/gallery">Voltar à galeria</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {album.name}
            </h1>
            <p className="mt-1 text-muted">
              {album.memberCount}{" "}
              {album.memberCount === 1 ? "membro" : "membros"} ·{" "}
              {album.viewCount} visitas · {album.visitorCount} visitantes únicos
            </p>
            {album.isVisitor && !album.isMember && (
              <Badge variant="outline" className="mt-2">
                Você está visitando — não é membro deste álbum
              </Badge>
            )}
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/gallery">← Galeria</Link>
          </Button>
        </div>

        <Card>
          <CardHeader className="gap-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Donos do álbum</CardTitle>
                <CardDescription>
                  Quem administra este álbum compartilhado
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {album.owners.map((owner) => (
                <Badge key={owner.userId} variant="default">
                  {owner.name}
                </Badge>
              ))}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardDescription className="tabular-nums">
                {album.ownedCount} de {TOTAL_STICKERS} — faltam {groupMissing}
              </CardDescription>
              <Badge variant="success" className="tabular-nums">
                {album.groupPercent}%
              </Badge>
            </div>
            <Progress value={album.groupPercent} className="h-3" />
          </CardContent>
        </Card>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid h-auto min-h-12 w-full max-w-md grid-cols-2">
            <TabsTrigger value="list">Figurinhas</TabsTrigger>
            <TabsTrigger value="duplicates">Repetidas</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <AlbumFilterBar
              selectionId={selectionId}
              search={search}
              resultCount={visibleNumbers.length}
              hasActiveSearch={hasActiveSearch}
              onSelectionChange={handleSelectionChange}
              onSearchChange={setSearch}
            />
            {visibleNumbers.length === 0 ? (
              <p className="py-16 text-center text-muted">Nenhum resultado</p>
            ) : (
              <StickerListGrouped
                numbers={visibleNumbers}
                owned={groupOwned}
                getState={getGroupState}
              />
            )}
          </TabsContent>

          <TabsContent value="duplicates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Repetidas para troca</CardTitle>
                <CardDescription>
                  Repetidas publicadas por outros membros — clique em
                  &quot;Trocar&quot; para solicitar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GalleryDuplicatesFeed
                  albumId={albumId}
                  duplicates={album.memberDuplicates}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
