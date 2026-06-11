"use client";

import * as React from "react";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
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
  SELECTIONS,
  TOTAL_STICKERS,
  formatOfficialCode,
  localNumberForGlobal,
  resolveAlbumFilter,
  selectionForNumber,
  stickerCount,
  stickersForSelection,
  type Selection,
} from "@/data/selections";
import { useOwnedStickers } from "@/hooks/use-owned-stickers";
import { cn } from "@/lib/utils";

const ALL = "all";

const inputClassName =
  "min-h-12 w-full rounded-xl border-2 border-border bg-card-muted px-3 text-base text-foreground shadow-[var(--shadow-1)] outline-none transition-colors duration-[var(--motion-instant)] focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copa-gold-bright";

export function AlbumClient() {
  const { owned, toggle, ready, ownedCount, percent } = useOwnedStickers();
  const [selectionId, setSelectionId] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [flash, setFlash] = React.useState<number | null>(null);

  const filter = React.useMemo(
    () => resolveAlbumFilter(search, selectionId),
    [search, selectionId],
  );

  const visibleNumbers = filter.numbers;

  React.useEffect(() => {
    if (!search.trim()) return;
    if (filter.selectionId !== ALL && filter.selectionId !== selectionId) {
      setSelectionId(filter.selectionId);
    }
  }, [filter.selectionId, search, selectionId]);

  React.useEffect(() => {
    const target = filter.exactSticker;
    if (target == null) return;

    const timer = window.setTimeout(() => {
      setFlash(target);
      document
        .getElementById(`sticker-${target}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => setFlash(null), 1400);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [filter.exactSticker]);

  const missing = TOTAL_STICKERS - ownedCount;
  const hasActiveSearch = search.trim().length > 0;

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2 max-sm:hidden">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meu álbum
          </h1>
          <p className="text-base text-muted">
            Toque na figurinha para marcar se você já tem. Os códigos seguem o
            verso Panini (ex.: BRA 7 ou posição 1–980 no checklist).
          </p>
        </div>

        <Card className="overflow-hidden max-sm:hidden">
          <CardHeader className="gap-4 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg sm:text-xl">Progresso geral</CardTitle>
                <CardDescription>
                  {ownedCount} de {TOTAL_STICKERS} — faltam {missing}
                </CardDescription>
              </div>
              <Badge variant="success" className="text-sm tabular-nums">
                {percent}%
              </Badge>
            </div>
            <Progress value={percent} className="h-3" />
          </CardHeader>
        </Card>

        {!ready ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-muted">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="text-base">Carregando seu progresso…</p>
          </div>
        ) : (
          <Tabs defaultValue="mark" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 max-sm:mx-auto">
              <TabsTrigger value="mark">Marcar</TabsTrigger>
              <TabsTrigger value="teams">Por seleção</TabsTrigger>
            </TabsList>

            <TabsContent value="mark" className="space-y-4">
              <Card
                className={cn(
                  "overflow-visible",
                  "max-sm:sticky max-sm:top-14 max-sm:z-30 max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 max-sm:bg-background/95 max-sm:shadow-none max-sm:backdrop-blur-md",
                )}
              >
                <CardContent className="flex flex-col gap-3 pt-4 sm:gap-4 sm:pt-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-foreground">
                      <span className="max-sm:sr-only">Seleção</span>
                      <select
                        value={selectionId}
                        onChange={(e) => handleSelectionChange(e.target.value)}
                        className={cn(inputClassName, "max-sm:order-2")}
                        aria-label="Filtrar por seleção"
                      >
                        <option value={ALL}>Todas ({TOTAL_STICKERS})</option>
                        {SELECTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({stickerCount(s)})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-foreground sm:max-w-md">
                      <span className="max-sm:sr-only">
                        Buscar (checklist ou verso)
                      </span>
                      <input
                        type="search"
                        inputMode="search"
                        autoCapitalize="characters"
                        autoComplete="off"
                        enterKeyHint="search"
                        placeholder="Ex: 42, BRA ou BRA 7"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={cn(inputClassName, "max-sm:order-1")}
                        aria-label="Buscar figurinha por número ou país"
                      />
                    </label>
                  </div>
                  {hasActiveSearch && (
                    <p className="text-sm text-muted" aria-live="polite">
                      {visibleNumbers.length === 0
                        ? "Nenhuma figurinha encontrada."
                        : visibleNumbers.length === 1
                          ? `1 figurinha — ${formatOfficialCode(selectionForNumber(visibleNumbers[0])!, visibleNumbers[0])} (#${visibleNumbers[0]})`
                          : `${visibleNumbers.length} figurinhas`}
                    </p>
                  )}
                </CardContent>
              </Card>

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
                  <p className="text-sm">
                    Tente outro número (1–980), código do verso ou nome do país.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                  {visibleNumbers.map((num) => {
                    const sel = selectionForNumber(num);
                    if (!sel) return null;
                    const isLogo = sel.versoPrefix === "00";
                    const local = localNumberForGlobal(sel, num);
                    const label = formatOfficialCode(sel, num);
                    return (
                      <button
                        key={num}
                        id={`sticker-${num}`}
                        type="button"
                        title={`Checklist #${num} · ${label}`}
                        onClick={() => toggle(num)}
                        className={cn(
                          "flex min-h-16 select-none flex-col items-center justify-center gap-0.5 rounded-2xl border-2 px-1 py-1.5 text-center transition-all duration-150 active:scale-95 touch-manipulation",
                          owned.has(num)
                            ? "border-success bg-success text-white shadow-[var(--shadow-1)]"
                            : "border-border bg-card-muted text-foreground hover:border-primary/50",
                          flash === num &&
                            "ring-4 ring-primary ring-offset-2 ring-offset-background",
                        )}
                      >
                        {isLogo ? (
                          <span className="text-sm font-bold leading-none">00</span>
                        ) : (
                          <>
                            <span className="text-[10px] font-semibold leading-none opacity-80 sm:text-[11px]">
                              {sel.versoPrefix}
                            </span>
                            <span className="text-base font-bold leading-none sm:text-lg">
                              {local}
                            </span>
                          </>
                        )}
                        <span
                          className={cn(
                            "text-[9px] font-medium tabular-nums leading-none opacity-60",
                            owned.has(num) && "text-white/80",
                          )}
                        >
                          #{num}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="teams">
              <div className="grid gap-4 sm:grid-cols-2">
                {SELECTIONS.map((sel) => {
                  const { got, total, pct } = selectionProgress(sel);
                  return (
                    <Card key={sel.id} className="shadow-sm">
                      <CardHeader className="pb-2">
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
                            : `${sel.versoPrefix} 1 — ${sel.versoPrefix} ${stickerCount(sel)}`}{" "}
                          · checklist {sel.startNumber}–{sel.endNumber}
                        </CardDescription>
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
          </Tabs>
        )}
      </main>
    </div>
  );
}
