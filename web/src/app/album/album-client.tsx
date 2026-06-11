"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
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
import { useSetAlbumShareTarget } from "@/components/albums/album-share-context";
import { AlbumSwitcher } from "@/components/albums/album-switcher";
import { GroupDuplicatesFeed } from "@/components/albums/group-duplicates-feed";
import { AlbumFilterBar } from "@/components/album-filter-bar";
import { StickerGridGrouped } from "@/components/sticker-grid-grouped";
import { StickerListGrouped } from "@/components/sticker-list-grouped";
import { SelectionFlag } from "@/components/selection-flag";
import { DuplicateEditor } from "@/components/duplicate-editor";
import {
  SELECTIONS,
  TOTAL_STICKERS,
  formatOfficialCode,
  resolveAlbumFilter,
  selectionForNumber,
  stickerCount,
  stickersForSelection,
  type Selection,
} from "@/data/selections";
import { useStickerCollection } from "@/hooks/use-sticker-collection";
import {
  getAlbumById,
  getAlbumGroupProgress,
  getAlbumSharedSnapshot,
  getMemberDuplicates,
  listMyAlbums,
  type AlbumSummary,
  type MemberDuplicate,
} from "@/app/actions/albums";
import { duplicatesPublished } from "@/lib/sticker-storage";
import type { StickerState } from "@/lib/sticker-storage";
import { cn } from "@/lib/utils";

const ALL = "all";

export function AlbumClient() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const {
    collection,
    owned,
    toggle,
    setDuplicateCount,
    getState,
    ready,
    ownedCount,
    percent,
    syncStatus,
  } = useStickerCollection();

  const [selectionId, setSelectionId] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [flash, setFlash] = React.useState<number | null>(null);
  const [editDuplicate, setEditDuplicate] = React.useState<number | null>(null);
  const [albums, setAlbums] = React.useState<AlbumSummary[]>([]);
  const [activeAlbumId, setActiveAlbumId] = React.useState<string | null>(null);
  const [groupOwned, setGroupOwned] = React.useState<Set<number>>(new Set());
  const [groupDuplicateCounts, setGroupDuplicateCounts] = React.useState<
    Map<number, number>
  >(new Map());
  const [memberDuplicates, setMemberDuplicates] = React.useState<MemberDuplicate[]>([]);
  const [filterNeededOnly, setFilterNeededOnly] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("list");
  const setAlbumShareTarget = useSetAlbumShareTarget();

  const filter = React.useMemo(
    () => resolveAlbumFilter(search, selectionId),
    [search, selectionId],
  );

  const visibleNumbers = filter.numbers;

  const isSharedAlbum = status === "authenticated" && activeAlbumId != null;
  const activeAlbum = albums.find((a) => a.id === activeAlbumId);
  const isAlbumOwner = activeAlbum?.role === "OWNER";
  const isMemberOnlyView = isSharedAlbum && activeAlbum != null && !isAlbumOwner;

  React.useEffect(() => {
    if (status !== "authenticated") return;
    const fromUrl = searchParams.get("albumId");

    listMyAlbums().then(async (list) => {
      setAlbums(list);

      if (fromUrl) {
        if (list.some((a) => a.id === fromUrl)) {
          setActiveAlbumId(fromUrl);
          return;
        }
        try {
          const album = await getAlbumById(fromUrl);
          const summary: AlbumSummary = {
            id: album.id,
            name: album.name,
            role: album.role,
            memberCount: album.memberCount,
            inviteToken: album.inviteToken,
          };
          setAlbums((prev) =>
            prev.some((a) => a.id === summary.id) ? prev : [...prev, summary],
          );
          setActiveAlbumId(fromUrl);
          return;
        } catch {
          // não é membro deste álbum
        }
      }

      if (list.length > 0) {
        setActiveAlbumId(list[0].id);
      }
    });
  }, [status, searchParams]);

  React.useEffect(() => {
    if (!activeAlbumId || status !== "authenticated") return;

    if (isMemberOnlyView) {
      getAlbumSharedSnapshot(activeAlbumId).then((snap) => {
        setGroupOwned(new Set(snap.owned));
        setGroupDuplicateCounts(
          new Map(
            snap.duplicateTotals.map((d) => [d.stickerNumber, d.totalDuplicates]),
          ),
        );
      });
      getMemberDuplicates(activeAlbumId, filterNeededOnly, {
        includeSelf: true,
      }).then(setMemberDuplicates);
      return;
    }

    getAlbumGroupProgress(activeAlbumId).then((nums) => setGroupOwned(new Set(nums)));
    getMemberDuplicates(activeAlbumId, filterNeededOnly).then(setMemberDuplicates);
  }, [activeAlbumId, status, filterNeededOnly, collection, isMemberOnlyView]);

  const getGroupState = React.useCallback(
    (num: number): StickerState => ({
      owned: groupOwned.has(num),
      duplicateCount: groupDuplicateCounts.get(num) ?? 0,
    }),
    [groupOwned, groupDuplicateCounts],
  );

  const listOwned = isMemberOnlyView ? groupOwned : owned;
  const listGetState = isMemberOnlyView ? getGroupState : getState;
  const groupMissing = TOTAL_STICKERS - groupOwned.size;

  React.useEffect(() => {
    if (!search.trim()) return;
    if (filter.selectionId !== ALL && filter.selectionId !== selectionId) {
      queueMicrotask(() => setSelectionId(filter.selectionId));
    }
  }, [filter.selectionId, search, selectionId]);

  React.useEffect(() => {
    if (isMemberOnlyView && !["list", "duplicates"].includes(activeTab)) {
      setActiveTab("list");
    }
  }, [isMemberOnlyView, activeTab]);

  React.useEffect(() => {
    const target = filter.exactSticker;
    if (target == null) return;
    if (!isMemberOnlyView) {
      setActiveTab("mark");
    }
    const timer = window.setTimeout(() => {
      setFlash(target);
      document
        .getElementById(
          isMemberOnlyView ? `list-sticker-${target}` : `sticker-${target}`,
        )
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => setFlash(null), 1400);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [filter.exactSticker, isMemberOnlyView]);

  const missing = TOTAL_STICKERS - ownedCount;
  const hasActiveSearch = search.trim().length > 0;
  const publishedDuplicates = duplicatesPublished(collection);
  const groupPercent =
    Math.round((groupOwned.size / TOTAL_STICKERS) * 1000) / 10;

  React.useEffect(() => {
    if (status !== "authenticated" || !activeAlbum) {
      setAlbumShareTarget(null);
      return;
    }
    setAlbumShareTarget({
      albumId: activeAlbum.id,
      albumName: activeAlbum.name,
      inviteToken: activeAlbum.inviteToken,
      isOwner: activeAlbum.role === "OWNER",
    });
    return () => setAlbumShareTarget(null);
  }, [status, activeAlbum, setAlbumShareTarget]);

  function selectionProgress(sel: Selection) {
    const nums = stickersForSelection(sel);
    const got = nums.filter((x) => owned.has(x)).length;
    const pct = Math.round((got / nums.length) * 1000) / 10;
    return { got, total: nums.length, pct };
  }

  function handleSelectionChange(value: string) {
    setSelectionId(value);
    setSearch("");
  }

  function openDuplicateEditor(num: number, e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditDuplicate(num);
  }

  const syncLabel =
    syncStatus === "loading"
      ? "Carregando da nuvem…"
      : syncStatus === "saving"
        ? "Salvando na nuvem…"
        : syncStatus === "synced"
          ? "Sincronizado"
          : status === "authenticated"
            ? "Offline"
            : null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      {editDuplicate != null && (
        <DuplicateEditor
          stickerNumber={editDuplicate}
          label={
            selectionForNumber(editDuplicate)
              ? formatOfficialCode(
                  selectionForNumber(editDuplicate)!,
                  editDuplicate,
                )
              : `#${editDuplicate}`
          }
          duplicateCount={getState(editDuplicate).duplicateCount}
          owned={getState(editDuplicate).owned}
          onSave={(count) => setDuplicateCount(editDuplicate, count)}
          onClose={() => setEditDuplicate(null)}
        />
      )}

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2 max-sm:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {isMemberOnlyView && activeAlbum ? activeAlbum.name : "Meu álbum"}
            </h1>
            {syncLabel && (
              <Badge variant="secondary" className="max-w-xs text-xs">
                {syncLabel}
              </Badge>
            )}
          </div>
          <p className="text-base text-muted max-sm:hidden">
            {isMemberOnlyView
              ? "Veja o que o grupo já colou no álbum e as repetidas disponíveis para trocar."
              : "Use Listar para ver o álbum por país. Em Marcar, toque para marcar; duplo clique ou segure para repetidas."}
          </p>
          {status === "authenticated" && albums.length > 0 && (
            <AlbumSwitcher
              albums={albums}
              activeAlbumId={activeAlbumId}
              onChange={setActiveAlbumId}
            />
          )}
        </div>

        <Card className="overflow-hidden max-sm:hidden">
          <CardHeader className="gap-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">
                  {isMemberOnlyView ? "Progresso do álbum" : "Progresso geral"}
                </CardTitle>
                <CardDescription>
                  {isMemberOnlyView
                    ? `${groupOwned.size} de ${TOTAL_STICKERS} — faltam ${groupMissing}`
                    : `${ownedCount} de ${TOTAL_STICKERS} — faltam ${missing}`}
                </CardDescription>
              </div>
              <Badge variant="success" className="text-sm tabular-nums">
                {isMemberOnlyView ? groupPercent : percent}%
              </Badge>
            </div>
            <Progress
              value={isMemberOnlyView ? groupPercent : percent}
              className="h-3"
            />
            {isSharedAlbum && !isMemberOnlyView && (
              <p className="text-sm text-muted">
                Grupo: {groupOwned.size}/{TOTAL_STICKERS} ({groupPercent}%)
              </p>
            )}
          </CardHeader>
        </Card>

        {!ready ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="text-base">Carregando seu progresso…</p>
          </div>
        ) : (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={cn(
                "grid h-auto min-h-12 w-full max-w-3xl gap-0.5 max-sm:mx-auto sm:gap-1",
                isMemberOnlyView
                  ? "grid-cols-2"
                  : isSharedAlbum
                    ? "grid-cols-2 sm:grid-cols-5"
                    : "grid-cols-4",
              )}
            >
              <TabsTrigger value="list" className="min-h-10 px-2 text-xs sm:px-4 sm:text-sm">
                Listar
              </TabsTrigger>
              {!isMemberOnlyView && (
                <>
                  <TabsTrigger value="mark" className="min-h-10 px-2 text-xs sm:px-4 sm:text-sm">
                    Marcar
                  </TabsTrigger>
                  <TabsTrigger value="teams" className="min-h-10 px-2 text-xs sm:px-4 sm:text-sm">
                    Seleções
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger value="duplicates" className="min-h-10 px-2 text-xs sm:px-4 sm:text-sm">
                Repetidas
              </TabsTrigger>
              {isSharedAlbum && !isMemberOnlyView && (
                <TabsTrigger value="group" className="min-h-10 px-2 text-xs sm:col-span-2 sm:px-4 sm:text-sm">
                  Grupo
                </TabsTrigger>
              )}
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
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted">
                  <p className="text-base font-medium text-foreground">
                    Nenhum resultado
                  </p>
                </div>
              ) : (
                <StickerListGrouped
                  numbers={visibleNumbers}
                  owned={listOwned}
                  getState={listGetState}
                  onEditDuplicate={isMemberOnlyView ? undefined : openDuplicateEditor}
                />
              )}
            </TabsContent>

            <TabsContent value="mark" className="space-y-4">
              <AlbumFilterBar
                selectionId={selectionId}
                search={search}
                resultCount={visibleNumbers.length}
                hasActiveSearch={hasActiveSearch}
                onSelectionChange={handleSelectionChange}
                onSearchChange={setSearch}
              />

              <Card className="overflow-hidden sm:hidden">
                <CardHeader className="gap-3 pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">Progresso</CardTitle>
                    <Badge variant="success" className="text-sm tabular-nums">
                      {percent}%
                    </Badge>
                  </div>
                  <CardDescription className="tabular-nums">
                    {ownedCount} de {TOTAL_STICKERS} — faltam {missing}
                  </CardDescription>
                  <Progress value={percent} className="h-2.5" />
                </CardHeader>
              </Card>

              {visibleNumbers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted">
                  <p className="text-base font-medium text-foreground">
                    Nenhum resultado
                  </p>
                </div>
              ) : (
                <StickerGridGrouped
                  numbers={visibleNumbers}
                  owned={owned}
                  getState={getState}
                  onToggle={toggle}
                  onEditDuplicate={openDuplicateEditor}
                  flash={flash}
                />
              )}
            </TabsContent>

            <TabsContent value="teams">
              <div className="grid gap-4 sm:grid-cols-2">
                {SELECTIONS.map((sel) => {
                  const { got, total, pct } = selectionProgress(sel);
                  return (
                    <Card key={sel.id} className="shadow-sm">
                      <CardHeader className="pb-2">
                        <div className="flex items-start gap-3">
                          <SelectionFlag selection={sel} size="sm" />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base font-semibold">
                                {sel.name}
                              </CardTitle>
                              <Badge variant="secondary" className="tabular-nums">
                                {got}/{total}
                              </Badge>
                            </div>
                            <CardDescription className="tabular-nums">
                              {sel.versoPrefix === "00"
                                ? "Código 00 (foil)"
                                : `${sel.versoPrefix} 1 — ${sel.versoPrefix} ${stickerCount(sel)}`}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Progress value={pct} className="h-2.5" />
                        <p className="mt-2 text-sm text-muted">{pct}% completo</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="duplicates" className="space-y-4">
              {isMemberOnlyView ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Repetidas do álbum</CardTitle>
                    <CardDescription>
                      Repetidas publicadas por todos os membros — incluindo as que
                      você ainda não tem.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <GroupDuplicatesFeed
                      duplicates={memberDuplicates}
                      filterNeededOnly={filterNeededOnly}
                      onFilterChange={setFilterNeededOnly}
                    />
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Minhas repetidas publicadas</CardTitle>
                    <CardDescription>
                      Figurinhas extras visíveis aos membros do álbum compartilhado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {publishedDuplicates.length === 0 ? (
                      <p className="text-muted">
                        Nenhuma repetida publicada. Segure uma figurinha na aba
                        Marcar para definir quantidade.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {publishedDuplicates.map((num) => {
                          const sel = selectionForNumber(num);
                          const label = sel
                            ? formatOfficialCode(sel, num)
                            : `#${num}`;
                          return (
                            <Badge key={num} variant="secondary">
                              {label} ×{getState(num).duplicateCount}
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {isSharedAlbum && (
              <TabsContent value="group" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Álbum do grupo</CardTitle>
                    <CardDescription>
                      Progresso união: {groupOwned.size}/{TOTAL_STICKERS} (
                      {groupPercent}%)
                    </CardDescription>
                    <Progress value={groupPercent} className="h-2.5" />
                  </CardHeader>
                  <CardContent>
                    <GroupDuplicatesFeed
                      duplicates={memberDuplicates}
                      filterNeededOnly={filterNeededOnly}
                      onFilterChange={setFilterNeededOnly}
                    />
                  </CardContent>
                </Card>
                {activeAlbumId && (
                  <Button asChild variant="outline" className="rounded-xl">
                    <Link href={`/albums/${activeAlbumId}/settings`}>
                      Gerenciar membros e convite
                    </Link>
                  </Button>
                )}
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
    </div>
  );
}
