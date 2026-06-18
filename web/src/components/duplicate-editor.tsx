"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DuplicateEditorProps = {
  stickerNumber: number;
  label: string;
  duplicateCount: number;
  owned: boolean;
  pending?: boolean;
  onSave: (count: number) => void;
  onClose: () => void;
};

export function DuplicateEditor({
  stickerNumber,
  label,
  duplicateCount,
  owned,
  pending = false,
  onSave,
  onClose,
}: DuplicateEditorProps) {
  const [count, setCount] = React.useState(duplicateCount);

  function applyCount(next: number) {
    setCount(next);
    onSave(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            Repetidas
            {pending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted" aria-hidden />
            )}
          </CardTitle>
          <CardDescription>
            {label} (#{stickerNumber}) — quantas cópias extras você tem para
            trocar?
            {pending && (
              <span className="mt-1 block text-primary">Salvando na nuvem…</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-xl text-xl"
              onClick={() => applyCount(Math.max(0, count - 1))}
            >
              −
            </Button>
            <span className="min-w-12 text-center text-3xl font-bold tabular-nums">
              {count}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-xl text-xl"
              onClick={() => applyCount(count + 1)}
            >
              +
            </Button>
          </div>
          {!owned && count === 0 && (
            <p className="text-center text-sm text-muted">
              Defina 1 ou mais para publicar como repetida.
            </p>
          )}
          <Button
            type="button"
            variant="ghost"
            className="min-h-12 w-full rounded-xl"
            onClick={onClose}
          >
            Fechar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
