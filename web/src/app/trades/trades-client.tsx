"use client";

import * as React from "react";
import Link from "next/link";
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
import {
  cancelTradeRequest,
  listMyTradeRequests,
  respondToTradeRequest,
  type TradeRequestSummary,
} from "@/app/actions/trades";
import type { TradeStatus } from "@prisma/client";

const STATUS_LABEL: Record<TradeStatus, string> = {
  PENDING: "Pendente",
  ACCEPTED: "Aceito",
  REJECTED: "Recusado",
  CANCELLED: "Cancelado",
};

const STATUS_VARIANT: Record<
  TradeStatus,
  "default" | "secondary" | "success" | "outline"
> = {
  PENDING: "secondary",
  ACCEPTED: "success",
  REJECTED: "outline",
  CANCELLED: "outline",
};

export function TradesClient() {
  const [trades, setTrades] = React.useState<TradeRequestSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<TradeStatus | "ALL">("ALL");
  const [actingId, setActingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const list = await listMyTradeRequests(
        filter === "ALL" ? undefined : filter,
      );
      setTrades(list);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  async function handleRespond(id: string, accept: boolean) {
    setActingId(id);
    setError(null);
    try {
      await respondToTradeRequest(id, accept);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao responder.");
    } finally {
      setActingId(null);
    }
  }

  async function handleCancel(id: string) {
    setActingId(id);
    setError(null);
    try {
      await cancelTradeRequest(id);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cancelar.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pedidos de troca</h1>
          <p className="mt-1 text-muted">
            Pedidos que você enviou ou recebeu de outros colecionadores.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {(["ALL", "PENDING", "ACCEPTED", "REJECTED", "CANCELLED"] as const).map(
            (value) => (
              <Button
                key={value}
                type="button"
                variant={filter === value ? "default" : "outline"}
                className="h-9 rounded-lg px-3 text-sm"
                onClick={() => setFilter(value)}
              >
                {value === "ALL" ? "Todos" : STATUS_LABEL[value]}
              </Button>
            ),
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-muted">Carregando…</p>
        ) : trades.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted">
              Nenhum pedido de troca
              {filter !== "ALL" ? ` com status "${STATUS_LABEL[filter]}"` : ""}.
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {trades.map((trade) => (
              <Card key={trade.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        {trade.stickerLabel}
                      </CardTitle>
                      <CardDescription>
                        Álbum: {trade.albumName}
                      </CardDescription>
                    </div>
                    <Badge variant={STATUS_VARIANT[trade.status]}>
                      {STATUS_LABEL[trade.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <p className="text-sm text-muted">
                    {trade.isIncoming ? (
                      <>
                        <strong>{trade.requesterName}</strong> quer trocar
                        com você
                      </>
                    ) : (
                      <>
                        Você pediu a <strong>{trade.targetName}</strong>
                      </>
                    )}
                  </p>
                  {trade.message && (
                    <p className="rounded-lg bg-card-muted p-3 text-sm text-foreground">
                      &ldquo;{trade.message}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    {new Date(trade.createdAt).toLocaleString("pt-BR")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trade.status === "PENDING" && trade.isIncoming && (
                      <>
                        <Button
                          type="button"
                          disabled={actingId === trade.id}
                          onClick={() => handleRespond(trade.id, true)}
                        >
                          Aceitar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={actingId === trade.id}
                          onClick={() => handleRespond(trade.id, false)}
                        >
                          Recusar
                        </Button>
                      </>
                    )}
                    {trade.status === "PENDING" && !trade.isIncoming && (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={actingId === trade.id}
                        onClick={() => handleCancel(trade.id)}
                      >
                        Cancelar pedido
                      </Button>
                    )}
                    <Button asChild variant="ghost" className="text-sm">
                      <Link href={`/gallery/${trade.albumId}`}>Ver álbum</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
