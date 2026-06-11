"use client";

import * as React from "react";
import { Share2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildAlbumInviteUrl } from "@/lib/album-invite";
import {
  ensureOwnerInviteCode,
  getAlbumOwners,
  regenerateOwnerInviteCode,
  type OwnerInviteInfo,
} from "@/app/actions/albums";
import { cn } from "@/lib/utils";

type AlbumShareActionsProps = {
  albumId: string;
  albumName: string;
  inviteToken: string;
  isOwner: boolean;
  className?: string;
  variant?: "buttons" | "icons";
};

type DialogMode = "member" | "owner" | null;

export function AlbumShareActions({
  albumId,
  albumName,
  inviteToken,
  isOwner,
  className,
  variant = "buttons",
}: AlbumShareActionsProps) {
  const [mode, setMode] = React.useState<DialogMode>(null);
  const [copied, setCopied] = React.useState(false);
  const [loadingOwner, setLoadingOwner] = React.useState(false);
  const [owners, setOwners] = React.useState<
    Awaited<ReturnType<typeof getAlbumOwners>>
  >([]);
  const [ownerInvite, setOwnerInvite] = React.useState<OwnerInviteInfo | null>(
    null,
  );
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  const memberInviteUrl = buildAlbumInviteUrl(inviteToken, "member");

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (mode && !dialog.open) dialog.showModal();
    if (!mode && dialog.open) dialog.close();
  }, [mode]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      setMode(null);
      setCopied(false);
      setOwners([]);
      setOwnerInvite(null);
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  React.useEffect(() => {
    if (mode !== "owner" || !isOwner) return;
    setLoadingOwner(true);
    Promise.all([getAlbumOwners(albumId), ensureOwnerInviteCode(albumId)])
      .then(([ownerList, invite]) => {
        setOwners(ownerList);
        setOwnerInvite(invite);
      })
      .finally(() => setLoadingOwner(false));
  }, [mode, albumId, isOwner]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function shareMemberLink() {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `Convite — ${albumName}`,
          text: "Entre no nosso álbum compartilhado de figurinhas!",
          url: memberInviteUrl,
        });
        closeDialog();
      } catch {
        /* user cancelled */
      }
    } else {
      await copyText(memberInviteUrl);
    }
  }

  async function handleRegenerateOwnerCode() {
    setLoadingOwner(true);
    try {
      const invite = await regenerateOwnerInviteCode(albumId);
      setOwnerInvite(invite);
    } finally {
      setLoadingOwner(false);
    }
  }

  return (
    <>
      <div
        className={
          variant === "icons"
            ? cn("flex items-center gap-0.5", className)
            : className
        }
      >
        {variant === "icons" ? (
          <>
            <Button
              type="button"
              variant="ghost"
              className="min-h-8 h-8 w-8 rounded-md p-0 text-muted hover:text-foreground"
              aria-label="Compartilhar álbum"
              onClick={() => setMode("member")}
            >
              <Share2 className="h-4 w-4" aria-hidden />
            </Button>
            {isOwner && (
              <Button
                type="button"
                variant="ghost"
                className="min-h-8 h-8 w-8 rounded-md p-0 text-muted hover:text-foreground"
                aria-label="Adicionar dono"
                onClick={() => setMode("owner")}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
              </Button>
            )}
          </>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 gap-2 rounded-xl"
              onClick={() => setMode("member")}
            >
              <Share2 className="h-4 w-4" aria-hidden />
              Compartilhar álbum
            </Button>
            {isOwner && (
              <Button
                type="button"
                variant="outline"
                className="min-h-10 gap-2 rounded-xl"
                onClick={() => setMode("owner")}
              >
                <UserPlus className="h-4 w-4" aria-hidden />
                Adicionar dono
              </Button>
            )}
          </>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="auth-modal fixed inset-0 z-50"
        aria-labelledby="share-album-title"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeDialog();
        }}
      >
        {mode && (
          <div
            className="flex h-full w-full items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeDialog();
            }}
          >
            <Card
              className="relative max-h-[90vh] w-full max-w-md shrink-0 overflow-y-auto shadow-[var(--shadow-3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                className="absolute right-3 top-3 z-10 min-h-9 w-9 rounded-full p-0 text-muted hover:text-foreground"
                aria-label="Fechar"
                onClick={closeDialog}
              >
                ✕
              </Button>

              {mode === "member" ? (
                <>
                  <CardHeader className="px-6 pb-2 pt-8">
                    <CardTitle id="share-album-title" className="text-xl">
                      Compartilhar álbum
                    </CardTitle>
                    <CardDescription>
                      Quem abrir este link entra como membro e pode ver repetidas
                      do grupo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 px-6 pb-6">
                    <code className="break-all rounded-lg bg-card-muted p-3 text-sm">
                      {memberInviteUrl}
                    </code>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="min-h-11 flex-1 rounded-xl"
                        onClick={shareMemberLink}
                      >
                        {typeof navigator !== "undefined" &&
                        typeof navigator.share === "function"
                          ? "Compartilhar"
                          : copied
                            ? "Copiado!"
                            : "Copiar link"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 rounded-xl"
                        onClick={() => copyText(memberInviteUrl)}
                      >
                        {copied ? "Copiado!" : "Copiar"}
                      </Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <>
                  <CardHeader className="px-6 pb-2 pt-8">
                    <CardTitle id="share-album-title" className="text-xl">
                      Donos do álbum
                    </CardTitle>
                    <CardDescription>
                      Compartilhe o código abaixo para adicionar um novo dono.
                      Ele deve entrar na conta e usar o código em Meus álbuns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4 px-6 pb-6">
                    <div>
                      <p className="mb-2 text-sm font-medium text-foreground">
                        Donos atuais ({owners.length})
                      </p>
                      {loadingOwner && owners.length === 0 ? (
                        <p className="text-sm text-muted">Carregando…</p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {owners.map((owner) => (
                            <li
                              key={owner.userId}
                              className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                            >
                              <span className="text-sm font-medium">
                                {owner.name}
                              </span>
                              <Badge variant="secondary">Dono</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="rounded-lg border border-border bg-card-muted p-4">
                      <p className="mb-2 text-sm font-medium text-foreground">
                        Código de convite de dono
                      </p>
                      {ownerInvite ? (
                        <p className="text-center font-mono text-2xl font-bold tracking-widest text-foreground">
                          {ownerInvite.codeFormatted}
                        </p>
                      ) : (
                        <p className="text-sm text-muted">
                          {loadingOwner
                            ? "Gerando código…"
                            : "Nenhum código ativo."}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-muted">
                        Válido até ser regenerado. Formato: XXXX-XXXX
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        className="min-h-11 flex-1 rounded-xl"
                        disabled={!ownerInvite || loadingOwner}
                        onClick={() =>
                          ownerInvite && copyText(ownerInvite.codeFormatted)
                        }
                      >
                        {copied ? "Copiado!" : "Copiar código"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="min-h-11 rounded-xl"
                        disabled={loadingOwner}
                        onClick={handleRegenerateOwnerCode}
                      >
                        Novo código
                      </Button>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        )}
      </dialog>
    </>
  );
}
