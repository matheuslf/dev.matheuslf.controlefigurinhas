"use client";

import * as React from "react";
import { Search } from "lucide-react";
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
import {
  SELECTIONS,
  TOTAL_STICKERS,
  formatOfficialCode,
  localNumberForGlobal,
  parseStickerQuery,
  selectionForNumber,
  stickerCount,
  stickersForSelection,
  type Selection,
} from "@/data/selections";
import { useOwnedStickers } from "@/hooks/use-owned-stickers";
import { cn } from "@/lib/utils";

const ALL = "all";

export function AlbumClient() {
  const { owned, toggle, ready, ownedCount, percent } = useOwnedStickers();
  const [selectionId, setSelectionId] = React.useState<string>(ALL);
  const [search, setSearch] = React.useState("");
  const [flash, setFlash] = React.useState<number | null>(null);

  const selection = React.useMemo(
    () => SELECTIONS.find((s) => s.id === selectionId),
    [selectionId],
  );

  const visibleNumbers = React.useMemo(() => {
    if (selectionId === ALL) {
      return Array.from({ length: TOTAL_STICKERS }, (_, i) => i + 1);
    }
    if (!selection) return [];
    return stickersForSelection(selection);
  }, [selectionId, selection]);

  const goToNumber = React.useCallback(() => {
    const n = parseStickerQuery(search.trim());
    if (n == null) return;
    setFlash(n);
    window.requestAnimationFrame(() => {
      document
        .getElementById(`sticker-${n}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    window.setTimeout(() => setFlash(null), 1400);
  }, [search]);

  const missing = TOTAL_STICKERS - ownedCount;

  function selectionProgress(sel: Selection) {
    const nums = stickersForSelection(sel);
    const got = nums.filter((x) => owned.has(x)).length;
    const pct = Math.round((got / nums.length) * 1000) / 10;
    return { got, total: nums.length, pct };
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meu álbum
          </h1>
          <p className="text-muted text-base">
            Toque na figurinha para marcar se você já tem. Os códigos seguem o
            verso Panini (ex.: BRA 7 ou posição 1–980 no checklist).
          </p>
        </div>

        <Card className="overflow-hidden">
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
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="mark">Marcar</TabsTrigger>
              <TabsTrigger value="teams">Por seleção</TabsTrigger>
            </TabsList>

            <TabsContent value="mark" className="space-y-4">
              <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                    <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-foreground">
                      Seleção
                      <select
                        value={selectionId}
                        onChange={(e) => setSelectionId(e.target.value)}
                        className="min-h-12 w-full rounded-xl border-2 border-border bg-white px-3 text-base font-medium text-foreground shadow-sm outline-none focus:border-primary"
                      >
                        <option value={ALL}>Todas ({TOTAL_STICKERS})</option>
                        {SELECTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({stickerCount(s)})
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="flex flex-1 flex-col gap-2 sm:max-w-xs">
                      <span className="text-sm font-medium text-foreground">
                        Buscar (checklist ou verso)
                      </span>
                      <div className="flex gap-2">
                        <input
                          inputMode="text"
                          autoCapitalize="characters"
                          placeholder="Ex: 42 ou BRA 7"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") goToNumber();
                          }}
                          className="min-h-12 w-full min-w-0 flex-1 rounded-xl border-2 border-border px-3 text-base outline-none focus:border-primary"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="min-h-12 shrink-0 px-4"
                          onClick={goToNumber}
                          aria-label="Buscar figurinha"
                        >
                          <Search className="size-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                          ? "border-success bg-success text-white shadow-sm"
                          : "border-border bg-white text-foreground hover:border-primary/50",
                        flash === num && "ring-4 ring-primary ring-offset-2",
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
