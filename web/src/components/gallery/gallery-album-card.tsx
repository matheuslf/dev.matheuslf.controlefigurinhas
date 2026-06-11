"use client";

import Link from "next/link";
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
import type { GalleryAlbumSummary, VisitedAlbumSummary } from "@/app/actions/gallery";

type GalleryAlbumCardProps = {
  album: GalleryAlbumSummary | VisitedAlbumSummary;
  showVisitMeta?: boolean;
};

function isVisitedAlbum(
  album: GalleryAlbumSummary | VisitedAlbumSummary,
): album is VisitedAlbumSummary {
  return "visitCount" in album && "lastVisitedAt" in album;
}

export function GalleryAlbumCard({ album, showVisitMeta }: GalleryAlbumCardProps) {
  const visited = isVisitedAlbum(album);

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{album.name}</CardTitle>
          {visited && (
            <Badge variant="outline" className="shrink-0 text-xs">
              Visitante
            </Badge>
          )}
        </div>
        <CardDescription className="flex flex-wrap gap-x-3 gap-y-1">
          <span>
            {album.memberCount}{" "}
            {album.memberCount === 1 ? "membro" : "membros"}
          </span>
          <span>·</span>
          <span>{album.viewCount} visitas</span>
          {"visitorCount" in album && (
            <>
              <span>·</span>
              <span>{album.visitorCount} visitantes únicos</span>
            </>
          )}
        </CardDescription>
        {showVisitMeta && visited && (
          <p className="text-xs text-muted">
            Você visitou {album.visitCount}{" "}
            {album.visitCount === 1 ? "vez" : "vezes"} · última{" "}
            {new Date(album.lastVisitedAt).toLocaleDateString("pt-BR")}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">
            Donos
          </p>
          <div className="flex flex-wrap gap-1.5">
            {album.owners.length === 0 ? (
              <span className="text-sm text-muted">Sem donos</span>
            ) : (
              album.owners.map((owner) => (
                <Badge key={owner.userId} variant="secondary">
                  {owner.name}
                </Badge>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-muted">Progresso</span>
            <Badge variant="success" className="tabular-nums">
              {album.groupPercent}%
            </Badge>
          </div>
          <Progress value={album.groupPercent} className="h-2" />
          <p className="mt-1 text-xs text-muted tabular-nums">
            {album.ownedCount} coladas · {album.totalDuplicates} repetidas
          </p>
        </div>

        <Button asChild className="mt-auto rounded-xl">
          <Link href={`/gallery/${album.id}`}>Ver álbum</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
