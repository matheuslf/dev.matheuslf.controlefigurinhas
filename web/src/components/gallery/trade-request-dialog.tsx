"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createTradeRequest } from "@/app/actions/trades";
import { formatOfficialCode, selectionForNumber } from "@/data/selections";

type TradeRequestDialogProps = {
  albumId: string;
  targetUserId: string;
  targetName: string;
  stickerNumber: number;
  onClose: () => void;
  onSuccess?: () => void;
};

export function TradeRequestDialog({
  albumId,
  targetUserId,
  targetName,
  stickerNumber,
  onClose,
  onSuccess,
}: TradeRequestDialogProps) {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const [message, setMessage] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sel = selectionForNumber(stickerNumber);
  const label = sel ? formatOfficialCode(sel, stickerNumber) : `#${stickerNumber}`;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      openAuthModal(`/gallery/${albumId}`);
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createTradeRequest({
        albumId,
        targetUserId,
        stickerNumber,
        message,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível enviar o pedido.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader>
          <CardTitle>Solicitar troca</CardTitle>
          <CardDescription>
            Pedir <strong>{label}</strong> de {targetName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium">
              Mensagem (opcional)
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Ex: Tenho ARG 5 para trocar!"
                className="rounded-xl border-2 border-border bg-card-muted px-3 py-2 outline-none focus:border-primary"
              />
            </label>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Enviando…" : "Enviar pedido"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
