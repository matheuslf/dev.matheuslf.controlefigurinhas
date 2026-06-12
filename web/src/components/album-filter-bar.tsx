"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  ALBUM_SECTION_GROUPS,
  SELECTIONS,
  TOTAL_STICKERS,
  selectionsForAlbumSection,
  stickerCount,
} from "@/data/selections";
import { cn } from "@/lib/utils";

const ALL = "all";

const inputClassName =
  "min-h-12 w-full rounded-xl border-2 border-border bg-card-muted px-3 text-base text-foreground shadow-[var(--shadow-1)] outline-none transition-colors duration-[var(--motion-instant)] focus:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-copa-gold-bright";

type AlbumFilterBarProps = {
  selectionId: string;
  search: string;
  resultCount: number;
  hasActiveSearch: boolean;
  onSelectionChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  className?: string;
};

export function AlbumFilterBar({
  selectionId,
  search,
  resultCount,
  hasActiveSearch,
  onSelectionChange,
  onSearchChange,
  className,
}: AlbumFilterBarProps) {
  const groupedSelections = ALBUM_SECTION_GROUPS.map((section) => ({
    section,
    selections: selectionsForAlbumSection(section),
  })).filter((g) => g.selections.length > 0);

  const listedIds = new Set(
    groupedSelections.flatMap((g) => g.selections.map((s) => s.id)),
  );
  const unlisted = SELECTIONS.filter((s) => !listedIds.has(s.id));

  return (
    <Card
      className={cn(
        "overflow-visible",
        "max-sm:sticky max-sm:top-14 max-sm:z-30 max-sm:-mx-4 max-sm:rounded-none max-sm:border-x-0 max-sm:border-t-0 max-sm:bg-background/95 max-sm:shadow-none max-sm:backdrop-blur-md",
        className,
      )}
    >
      <CardContent className="flex flex-col gap-3 pt-4 sm:gap-4 sm:pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-foreground">
            <span className="max-sm:sr-only">Seleção</span>
            <select
              value={selectionId}
              onChange={(e) => onSelectionChange(e.target.value)}
              className={cn(inputClassName, "max-sm:order-2")}
              aria-label="Filtrar por seleção"
            >
              <option value={ALL}>Todas ({TOTAL_STICKERS})</option>
              {groupedSelections.map(({ section, selections }) => (
                <optgroup key={section.sectionId} label={section.sectionLabel}>
                  {selections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({stickerCount(s)})
                    </option>
                  ))}
                </optgroup>
              ))}
              {unlisted.length > 0 && (
                <optgroup label="Outras">
                  {unlisted.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({stickerCount(s)})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium text-foreground sm:max-w-md">
            <span className="max-sm:sr-only">Buscar</span>
            <input
              type="search"
              inputMode="search"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="Ex: 42, BRA 7, LEG 5, Kane"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(inputClassName, "max-sm:order-1")}
            />
          </label>
        </div>
        {hasActiveSearch && (
          <p className="text-sm text-muted" aria-live="polite">
            {resultCount === 0
              ? "Nenhuma figurinha encontrada."
              : `${resultCount} figurinha(s)`}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export { ALL as ALBUM_FILTER_ALL };
