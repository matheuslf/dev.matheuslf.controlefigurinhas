"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthModal } from "@/components/auth/auth-modal-context";
import { joinAlbumByOwnerCode } from "@/app/actions/albums";
import { formatOwnerInviteCode, normalizeOwnerInviteCode } from "@/lib/owner-invite-code";

export function JoinOwnerCodeCard() {
  const { status } = useSession();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const [code, setCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function handleCodeChange(value: string) {
    setCode(normalizeOwnerInviteCode(value).slice(0, 8));
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "authenticated") {
      openAuthModal("/albums");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const albumId = await joinAlbumByOwnerCode(code);
      router.push(`/album?albumId=${albumId}`);
    } catch {
      setError("Código inválido ou expirado. Peça um novo código ao dono.");
    } finally {
      setLoading(false);
    }
  }

  const displayCode = formatOwnerInviteCode(code);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Entrar como dono</CardTitle>
        <CardDescription>
          Digite o código de 8 caracteres que o dono do álbum compartilhou com
          você.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Código de convite
            <input
              type="text"
              inputMode="text"
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="XXXX-XXXX"
              value={displayCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="min-h-12 rounded-xl border-2 border-border bg-card-muted px-3 text-center font-mono text-lg tracking-widest outline-none focus:border-primary"
            />
          </label>
          <Button
            type="submit"
            className="min-h-12 rounded-xl"
            disabled={loading || code.length < 8}
          >
            {loading
              ? "Entrando…"
              : status === "authenticated"
                ? "Entrar como dono"
                : "Entrar para usar código"}
          </Button>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
