"use client";

import * as React from "react";
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
  onSave: (count: number) => void;
  onClose: () => void;
};

export function DuplicateEditor({
  stickerNumber,
  label,
  duplicateCount,
  owned,
  onSave,
  onClose,
}: DuplicateEditorProps) {
  const [count, setCount] = React.useState(duplicateCount);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-lg">Repetidas</CardTitle>
          <CardDescription>
            {label} (#{stickerNumber}) — quantas cópias extras você tem para
            trocar?
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="outline"
              className="h-12 w-12 rounded-xl text-xl"
              onClick={() => setCount((c) => Math.max(0, c - 1))}
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
              onClick={() => setCount((c) => c + 1)}
            >
              +
            </Button>
          </div>
          {!owned && count === 0 && (
            <p className="text-center text-sm text-muted">
              Defina 1 ou mais para publicar como repetida.
            </p>
          )}
          <div className="flex gap-2">
            <Button
              type="button"
              className="min-h-12 flex-1 rounded-xl"
              onClick={() => {
                onSave(count);
                onClose();
              }}
            >
              Salvar
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="min-h-12 rounded-xl"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
