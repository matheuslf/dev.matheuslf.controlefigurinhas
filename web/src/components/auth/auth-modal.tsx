"use client";

import * as React from "react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthModalProps = {
  open: boolean;
  callbackUrl: string;
  authError?: string | null;
  onClose: () => void;
};

export function AuthModal({ open, callbackUrl, authError, onClose }: AuthModalProps) {
  const dialogRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  React.useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleClose() {
      onClose();
    }
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <dialog
      ref={dialogRef}
      className="auth-modal fixed inset-0 z-50"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === dialogRef.current) closeDialog();
      }}
    >
      {open && (
        <div
          className="flex h-full w-full items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <Card
            className="relative w-full max-w-md shrink-0 shadow-[var(--shadow-3)]"
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

            <CardHeader className="items-center px-8 pb-2 pt-10 text-center">
              <CardTitle id="auth-modal-title" className="w-full text-center text-2xl">
                Entrar
              </CardTitle>
              <CardDescription className="mx-auto max-w-[280px] text-center text-base leading-relaxed">
                Entre com Google ou crie sua conta com e-mail e senha.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center px-8 pb-10 pt-4">
              <SignInForm
                callbackUrl={callbackUrl}
                initialError={authError}
                onClose={onClose}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </dialog>
  );
}
